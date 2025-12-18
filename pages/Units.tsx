
import React, { useState } from 'react';
import { WorkspaceStore, Unit, UnitStatus } from '../types';
import { Plus, Search, Filter, Edit2, Trash2, X } from 'lucide-react';

interface Props {
  store: WorkspaceStore;
  updateStore: (updater: (prev: WorkspaceStore) => WorkspaceStore) => void;
}

const Units: React.FC<Props> = ({ store, updateStore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [filterStatus, setFilterStatus] = useState<UnitStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Unit>>({
    name: '',
    baseRent: 0,
    status: UnitStatus.Vacant
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore(prev => {
      if (editingUnit) {
        return {
          ...prev,
          units: prev.units.map(u => u.id === editingUnit.id ? { ...u, ...formData } as Unit : u)
        };
      } else {
        const newUnit: Unit = {
          id: crypto.randomUUID(),
          name: formData.name || 'Phòng mới',
          baseRent: formData.baseRent || 0,
          status: formData.status || UnitStatus.Vacant
        };
        return { ...prev, units: [...prev.units, newUnit] };
      }
    });
    setIsModalOpen(false);
    setEditingUnit(null);
    setFormData({ name: '', baseRent: 0, status: UnitStatus.Vacant });
  };

  const deleteUnit = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      updateStore(prev => ({ ...prev, units: prev.units.filter(u => u.id !== id) }));
    }
  };

  const filteredUnits = store.units.filter(u => {
    const matchesStatus = filterStatus === 'All' || u.status === filterStatus;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Danh sách phòng</h2>
          <p className="text-gray-500 text-sm">Quản lý tình trạng phòng và giá thuê gốc.</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingUnit(null); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} /> Thêm phòng
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên phòng..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-gray-900">
          <Filter size={18} className="text-gray-400" />
          <select 
            className="border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value={UnitStatus.Vacant}>Phòng trống</option>
            <option value={UnitStatus.Occupied}>Đã thuê</option>
            <option value={UnitStatus.Maintenance}>Bảo trì</option>
          </select>
        </div>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên phòng</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold">Giá thuê gốc</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredUnits.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">Không tìm thấy phòng nào.</td>
                </tr>
              )}
              {filteredUnits.map(unit => (
                <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{unit.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      unit.status === UnitStatus.Vacant ? 'bg-green-100 text-green-700' :
                      unit.status === UnitStatus.Occupied ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {unit.status === UnitStatus.Vacant ? 'Phòng trống' :
                       unit.status === UnitStatus.Occupied ? 'Đã thuê' : 'Bảo trì'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{unit.baseRent.toLocaleString()}đ</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingUnit(unit);
                          setFormData(unit);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteUnit(unit.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingUnit ? 'Sửa thông tin phòng' : 'Thêm phòng mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Tên phòng</label>
                <input 
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Giá thuê (đ)</label>
                <input 
                  type="number"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" 
                  value={formData.baseRent} 
                  onChange={e => setFormData({ ...formData, baseRent: Number(e.target.value) })} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Trạng thái</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as UnitStatus })}
                >
                  <option value={UnitStatus.Vacant}>Phòng trống</option>
                  <option value={UnitStatus.Occupied}>Đã thuê</option>
                  <option value={UnitStatus.Maintenance}>Bảo trì</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Units;
