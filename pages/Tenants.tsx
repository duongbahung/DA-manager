
import React, { useState } from 'react';
import { WorkspaceStore, Tenant } from '../types';
import { Plus, Search, Edit2, Trash2, X, Phone, User as UserIcon } from 'lucide-react';

interface Props {
  store: WorkspaceStore;
  updateStore: (updater: (prev: WorkspaceStore) => WorkspaceStore) => void;
}

const Tenants: React.FC<Props> = ({ store, updateStore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Tenant>>({
    fullName: '',
    phone: '',
    emergencyContact: '',
    cccd: '',
    notes: '',
    vehiclePlates: []
  });

  const [newPlate, setNewPlate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore(prev => {
      if (editingTenant) {
        return {
          ...prev,
          tenants: prev.tenants.map(t => t.id === editingTenant.id ? { ...t, ...formData } as Tenant : t)
        };
      } else {
        const newTenant: Tenant = {
          id: crypto.randomUUID(),
          fullName: formData.fullName || '',
          phone: formData.phone || '',
          emergencyContact: formData.emergencyContact || '',
          cccd: formData.cccd || '',
          notes: formData.notes || '',
          vehiclePlates: formData.vehiclePlates || []
        };
        return { ...prev, tenants: [...prev.tenants, newTenant] };
      }
    });
    setIsModalOpen(false);
    setEditingTenant(null);
    setFormData({ fullName: '', phone: '', emergencyContact: '', cccd: '', notes: '', vehiclePlates: [] });
  };

  const deleteTenant = (id: string) => {
    if (confirm('Bạn có chắc xóa khách hàng này?')) {
      updateStore(prev => ({ ...prev, tenants: prev.tenants.filter(t => t.id !== id) }));
    }
  };

  const filteredTenants = store.tenants.filter(t => 
    t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý khách thuê</h2>
          <p className="text-gray-500 text-sm">Lưu trữ thông tin liên lạc và định danh.</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingTenant(null); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> Thêm khách
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Tìm theo tên hoặc số điện thoại..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 italic">Chưa có khách thuê nào.</div>
        )}
        {filteredTenants.map(tenant => (
          <div key={tenant.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{tenant.fullName}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone size={12} /> {tenant.phone}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingTenant(tenant); setFormData(tenant); setIsModalOpen(true); }} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteTenant(tenant.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-800">
              <div className="flex justify-between">
                <span className="text-gray-500">CCCD:</span>
                <span className="font-medium">{tenant.cccd || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Người LH khẩn cấp:</span>
                <span className="font-medium">{tenant.emergencyContact || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Biển số xe:</span>
                <div className="flex flex-wrap gap-1">
                  {tenant.vehiclePlates.length === 0 ? <span className="text-xs text-gray-400 italic">Chưa có</span> : 
                    tenant.vehiclePlates.map(p => (
                      <span key={p} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">{p}</span>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">{editingTenant ? 'Sửa thông tin khách' : 'Thêm khách thuê'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Họ và tên</label>
                <input required className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Số điện thoại</label>
                <input required className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">CCCD/CMND</label>
                <input className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900" value={formData.cccd} onChange={e => setFormData({ ...formData, cccd: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Người liên hệ khẩn cấp</label>
                <input className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900" value={formData.emergencyContact} onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400">Biển số xe</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900" 
                    placeholder="VD: 59-X1 12345" 
                    value={newPlate} 
                    onChange={e => setNewPlate(e.target.value)} 
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newPlate.trim()) {
                          setFormData({ ...formData, vehiclePlates: [...(formData.vehiclePlates || []), newPlate.trim()] });
                          setNewPlate('');
                        }
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (newPlate.trim()) {
                        setFormData({ ...formData, vehiclePlates: [...(formData.vehiclePlates || []), newPlate.trim()] });
                        setNewPlate('');
                      }
                    }}
                    className="px-4 py-2 bg-slate-200 text-gray-800 rounded-xl font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.vehiclePlates?.map((p, i) => (
                    <span key={i} className="bg-slate-100 px-3 py-1 rounded-full text-xs flex items-center gap-2 text-gray-700 font-medium">
                      {p}
                      <button type="button" onClick={() => setFormData({ ...formData, vehiclePlates: formData.vehiclePlates?.filter((_, idx) => idx !== i) })}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Ghi chú</label>
                <textarea className="w-full border border-gray-300 rounded-xl px-4 py-2 h-20 bg-white text-gray-900" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="col-span-2 pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;
