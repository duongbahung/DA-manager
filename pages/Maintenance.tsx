
import React, { useState } from 'react';
import { WorkspaceStore, MaintenanceTicket, MaintenancePriority, MaintenanceStatus } from '../types';
import { Plus, Wrench, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

interface Props {
  store: WorkspaceStore;
  updateStore: (updater: (prev: WorkspaceStore) => WorkspaceStore) => void;
}

const Maintenance: React.FC<Props> = ({ store, updateStore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null);

  const [formData, setFormData] = useState<Partial<MaintenanceTicket>>({
    unitId: '',
    description: '',
    priority: MaintenancePriority.Medium,
    status: MaintenanceStatus.Pending,
    slaDueDate: new Date().toISOString().split('T')[0],
    repairCost: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unitId || !formData.description) return alert('Dữ liệu thiếu!');

    updateStore(prev => {
      const ticket: MaintenanceTicket = {
        id: editingTicket?.id || crypto.randomUUID(),
        unitId: formData.unitId!,
        description: formData.description!,
        priority: formData.priority as any,
        status: formData.status as any,
        slaDueDate: formData.slaDueDate!,
        repairCost: Number(formData.repairCost)
      };

      if (editingTicket) {
        return { ...prev, maintenance: prev.maintenance.map(t => t.id === editingTicket.id ? ticket : t) };
      } else {
        return { ...prev, maintenance: [ticket, ...prev.maintenance] };
      }
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bảo trì & Sửa chữa</h2>
          <p className="text-gray-500 text-sm">Theo dõi các yêu cầu kỹ thuật và chi phí vận hành.</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingTicket(null); setFormData({
            unitId: '',
            description: '',
            priority: MaintenancePriority.Medium,
            status: MaintenanceStatus.Pending,
            slaDueDate: new Date().toISOString().split('T')[0],
            repairCost: 0
          }); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> Tạo phiếu mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {store.maintenance.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 italic">Không có yêu cầu bảo trì.</div>
        )}
        {store.maintenance.map(ticket => {
          const unit = store.units.find(u => u.id === ticket.unitId);
          return (
            <div key={ticket.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  ticket.priority === 'High' ? 'bg-red-100 text-red-600' : 
                  ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {ticket.priority} Priority
                </span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingTicket(ticket); setFormData(ticket); setIsModalOpen(true); }} className="p-1 text-blue-600"><Edit2 size={14} /></button>
                  <button onClick={() => { if(confirm('Xóa?')) updateStore(p => ({ ...p, maintenance: p.maintenance.filter(t => t.id !== ticket.id) })); }} className="p-1 text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{unit?.name || 'Đã xóa'}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{ticket.description}</p>
              
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">Trạng thái:</span>
                  <span className={ticket.status === 'Completed' ? 'text-green-600' : 'text-blue-600'}>{ticket.status}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Hạn xử lý:</span>
                  <span className="font-medium">{ticket.slaDueDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Chi phí:</span>
                  <span className="font-black text-red-500">{ticket.repairCost.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-bold">{editingTicket ? 'Cập nhật phiếu' : 'Tạo phiếu bảo trì'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Chọn Phòng</label>
                <select className="w-full border rounded-xl px-4 py-2" value={formData.unitId} onChange={e => setFormData({ ...formData, unitId: e.target.value })}>
                  <option value="">-- Chọn phòng --</option>
                  {store.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Mô tả sự cố</label>
                <textarea required className="w-full border rounded-xl px-4 py-2 h-24" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Ưu tiên</label>
                <select className="w-full border rounded-xl px-4 py-2" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as any })}>
                  <option value={MaintenancePriority.Low}>Thấp</option>
                  <option value={MaintenancePriority.Medium}>Trung bình</option>
                  <option value={MaintenancePriority.High}>Cao</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Trạng thái</label>
                <select className="w-full border rounded-xl px-4 py-2" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value={MaintenanceStatus.Pending}>Chờ xử lý</option>
                  <option value={MaintenanceStatus.InProgress}>Đang sửa</option>
                  <option value={MaintenanceStatus.Completed}>Đã xong</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Hạn xử lý (SLA)</label>
                <input type="date" className="w-full border rounded-xl px-4 py-2" value={formData.slaDueDate} onChange={e => setFormData({ ...formData, slaDueDate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Dự kiến chi phí (đ)</label>
                <input type="number" className="w-full border rounded-xl px-4 py-2" value={formData.repairCost} onChange={e => setFormData({ ...formData, repairCost: Number(e.target.value) })} />
              </div>
              <div className="col-span-2 pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-xl font-medium">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Lưu phiếu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
