
import React, { useState } from 'react';
import { WorkspaceStore, Lease, LeaseStatus, UnitStatus } from '../types';
import { Plus, Edit2, Trash2, X, AlertTriangle, Power } from 'lucide-react';

interface Props {
  store: WorkspaceStore;
  updateStore: (updater: (prev: WorkspaceStore) => WorkspaceStore) => void;
}

const Leases: React.FC<Props> = ({ store, updateStore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const [formData, setFormData] = useState<Partial<Lease>>({
    unitId: '',
    tenantId: '',
    startDate: new Date().toISOString().split('T')[0],
    months: 6,
    deposit: 0,
    rentMonthly: 0,
    adults: 1,
    children: 0,
    status: LeaseStatus.Active
  });

  const getEndDate = (start: string, months: number) => {
    if (!start || !months) return '';
    const date = new Date(start);
    date.setMonth(date.getMonth() + Number(months));
    return date.toISOString().split('T')[0];
  };

  const handleUnitChange = (id: string) => {
    const unit = store.units.find(u => u.id === id);
    setFormData({ ...formData, unitId: id, rentMonthly: unit?.baseRent || 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unitId || !formData.tenantId) return alert('Vui lòng chọn phòng và khách!');

    // Rule: One active lease per unit
    const existingActive = store.leases.find(l => 
      l.unitId === formData.unitId && 
      l.status === LeaseStatus.Active && 
      (!editingLease || l.id !== editingLease.id)
    );

    if (existingActive && formData.status === LeaseStatus.Active) {
      return alert('Phòng này hiện đã có hợp đồng còn hiệu lực!');
    }

    updateStore(prev => {
      let newLeases = [...prev.leases];
      let newUnits = [...prev.units];

      const leaseData: Lease = {
        id: editingLease?.id || crypto.randomUUID(),
        unitId: formData.unitId!,
        tenantId: formData.tenantId!,
        startDate: formData.startDate!,
        months: Number(formData.months),
        endDate: getEndDate(formData.startDate!, Number(formData.months)),
        deposit: Number(formData.deposit),
        rentMonthly: Number(formData.rentMonthly),
        adults: Number(formData.adults),
        children: Number(formData.children),
        status: formData.status!
      };

      if (editingLease) {
        newLeases = newLeases.map(l => l.id === editingLease.id ? leaseData : l);
      } else {
        newLeases.push(leaseData);
      }

      // Update unit status
      newUnits = newUnits.map(u => {
        if (u.id === formData.unitId) {
          return { ...u, status: leaseData.status === LeaseStatus.Active ? UnitStatus.Occupied : UnitStatus.Vacant };
        }
        return u;
      });

      return { ...prev, leases: newLeases, units: newUnits };
    });

    setIsModalOpen(false);
    setEditingLease(null);
  };

  const endLease = (id: string) => {
    if (confirm('Bạn muốn kết thúc hợp đồng này? Phòng sẽ chuyển sang trạng thái Trống.')) {
      updateStore(prev => {
        const lease = prev.leases.find(l => l.id === id);
        if (!lease) return prev;
        
        return {
          ...prev,
          leases: prev.leases.map(l => l.id === id ? { ...l, status: LeaseStatus.Ended } : l),
          units: prev.units.map(u => u.id === lease.unitId ? { ...u, status: UnitStatus.Vacant } : u)
        };
      });
    }
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hợp đồng thuê</h2>
          <p className="text-gray-500 text-sm">Quản lý thời hạn, tiền cọc và cư dân.</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingLease(null); setFormData({
            unitId: '',
            tenantId: '',
            startDate: new Date().toISOString().split('T')[0],
            months: 6,
            deposit: 0,
            rentMonthly: 0,
            adults: 1,
            children: 0,
            status: LeaseStatus.Active
          }); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md"
        >
          <Plus size={18} /> Lập hợp đồng
        </button>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Phòng</th>
                <th className="px-6 py-4 font-semibold">Người thuê</th>
                <th className="px-6 py-4 font-semibold">Thời hạn</th>
                <th className="px-6 py-4 font-semibold">Tiền thuê / Cọc</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {store.leases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Chưa có hợp đồng nào.</td>
                </tr>
              )}
              {store.leases.map(lease => {
                const unit = store.units.find(u => u.id === lease.unitId);
                const tenant = store.tenants.find(t => t.id === lease.tenantId);
                return (
                  <tr key={lease.id} className="hover:bg-gray-50 text-gray-900">
                    <td className="px-6 py-4 font-bold">{unit?.name || 'Phòng đã xóa'}</td>
                    <td className="px-6 py-4 font-medium">{tenant?.fullName || 'Khách đã xóa'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{lease.startDate}</span>
                        <span className="text-gray-400 text-xs font-medium">đến {lease.endDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-blue-700">{lease.rentMonthly.toLocaleString()}đ</span>
                        <span className="text-gray-500 text-xs">Cọc: {lease.deposit.toLocaleString()}đ</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lease.status === LeaseStatus.Active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {lease.status === LeaseStatus.Active ? 'Hiệu lực' : 'Đã kết thúc'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lease.status === LeaseStatus.Active && (
                          <button onClick={() => endLease(lease.id)} title="Kết thúc HĐ" className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors">
                            <Power size={16} />
                          </button>
                        )}
                        <button onClick={() => { setEditingLease(lease); setFormData(lease); setIsModalOpen(true); }} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { if(confirm('Xóa hợp đồng?')) updateStore(p => ({ ...p, leases: p.leases.filter(l => l.id !== lease.id) })); }} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between bg-blue-50">
              <h3 className="text-xl font-bold text-gray-900">{editingLease ? 'Cập nhật hợp đồng' : 'Lập hợp đồng mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Chọn Phòng</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.unitId} 
                  onChange={e => handleUnitChange(e.target.value)}
                  disabled={!!editingLease}
                >
                  <option value="">-- Chọn phòng --</option>
                  {store.units.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.status === 'Vacant' ? 'Trống' : 'Đang ở/Bảo trì'})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Khách thuê</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.tenantId} 
                  onChange={e => setFormData({ ...formData, tenantId: e.target.value })}
                  disabled={!!editingLease}
                >
                  <option value="">-- Chọn khách --</option>
                  {store.tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName} ({t.phone})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Ngày bắt đầu</label>
                <input type="date" className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Số tháng thuê</label>
                <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={formData.months} onChange={e => setFormData({ ...formData, months: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Tiền thuê hàng tháng (đ)</label>
                <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-blue-700 font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.rentMonthly} onChange={e => setFormData({ ...formData, rentMonthly: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Tiền cọc (đ)</label>
                <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={formData.deposit} onChange={e => setFormData({ ...formData, deposit: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Số người lớn</label>
                <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={formData.adults} onChange={e => setFormData({ ...formData, adults: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Số trẻ em</label>
                <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={formData.children} onChange={e => setFormData({ ...formData, children: Number(e.target.value) })} />
              </div>
              <div className="col-span-2 pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md">Lưu hợp đồng</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leases;
