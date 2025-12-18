
import React, { useState } from 'react';
import { WorkspaceStore, ElectricReading } from '../types';
import { Plus, Edit2, Trash2, X, Zap } from 'lucide-react';

interface Props {
  store: WorkspaceStore;
  updateStore: (updater: (prev: WorkspaceStore) => WorkspaceStore) => void;
}

const Electric: React.FC<Props> = ({ store, updateStore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<ElectricReading | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [formData, setFormData] = useState<Partial<ElectricReading>>({
    unitId: '',
    month: selectedMonth,
    startValue: 0,
    endValue: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unitId || !formData.month) return alert('Vui lòng chọn phòng và tháng!');
    if ((formData.endValue || 0) < (formData.startValue || 0)) return alert('Số cuối phải lớn hơn hoặc bằng số đầu!');

    // Check unique unit+month
    const existing = store.electricReadings.find(r => r.unitId === formData.unitId && r.month === formData.month && (!editingReading || r.id !== editingReading.id));
    if (existing) return alert('Tháng này đã có chỉ số điện cho phòng này!');

    updateStore(prev => {
      const data: ElectricReading = {
        id: editingReading?.id || crypto.randomUUID(),
        unitId: formData.unitId!,
        month: formData.month!,
        startValue: Number(formData.startValue),
        endValue: Number(formData.endValue),
        kwh: Number(formData.endValue) - Number(formData.startValue)
      };
      
      if (editingReading) {
        return { ...prev, electricReadings: prev.electricReadings.map(r => r.id === editingReading.id ? data : r) };
      } else {
        return { ...prev, electricReadings: [...prev.electricReadings, data] };
      }
    });
    setIsModalOpen(false);
  };

  const filteredReadings = store.electricReadings.filter(r => r.month === selectedMonth);

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chỉ số điện</h2>
          <p className="text-gray-500 text-sm">Ghi nhận lượng điện tiêu thụ hàng tháng.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="month" 
            className="border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)} 
          />
          <button 
            onClick={() => { 
              setIsModalOpen(true); 
              setEditingReading(null); 
              setFormData({ ...formData, month: selectedMonth }); 
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm"
          >
            <Plus size={18} /> Nhập chỉ số
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {store.units.map(unit => {
          const reading = filteredReadings.find(r => r.unitId === unit.id);
          return (
            <div key={unit.id} className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col gap-3 relative overflow-hidden group transition-all ${reading ? 'border-blue-200' : 'border-gray-100 opacity-60'}`}>
              {!reading && <div className="absolute top-0 right-0 p-2 text-[10px] font-bold text-gray-400 bg-gray-50 rounded-bl-xl uppercase">Chưa ghi</div>}
              {reading && <div className="absolute top-0 right-0 p-2 text-[10px] font-bold text-blue-600 bg-blue-50 rounded-bl-xl uppercase">Đã ghi</div>}
              
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${reading ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Zap size={16} />
                </div>
                <span className="font-bold text-gray-800">{unit.name}</span>
              </div>

              {reading ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Số đầu: {reading.startValue}</span>
                    <span>Số cuối: {reading.endValue}</span>
                  </div>
                  <div className="text-xl font-black text-gray-900">{reading.kwh} <span className="text-sm font-normal text-gray-500">kWh</span></div>
                  <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingReading(reading); setFormData(reading); setIsModalOpen(true); }} className="text-xs font-bold text-blue-600 hover:underline">Sửa</button>
                    <button onClick={() => { if(confirm('Xóa?')) updateStore(p => ({ ...p, electricReadings: p.electricReadings.filter(r => r.id !== reading.id) })); }} className="text-xs font-bold text-red-600 hover:underline">Xóa</button>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <button onClick={() => { setIsModalOpen(true); setEditingReading(null); setFormData({ unitId: unit.id, month: selectedMonth, startValue: 0, endValue: 0 }); }} className="text-xs font-bold text-blue-600 border border-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 transition-colors">Ghi chỉ số</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Ghi số điện</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wide">Phòng</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.unitId} 
                  onChange={e => setFormData({ ...formData, unitId: e.target.value })}
                  disabled={!!editingReading}
                >
                  <option value="">-- Chọn phòng --</option>
                  {store.units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wide">Tháng</label>
                <input type="month" className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wide">Số đầu</label>
                  <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={formData.startValue} onChange={e => setFormData({ ...formData, startValue: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wide">Số cuối</label>
                  <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.endValue} onChange={e => setFormData({ ...formData, endValue: Number(e.target.value) })} />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Electric;
