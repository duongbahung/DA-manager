
import React, { useState } from 'react';
import { WorkspaceStore, WorkspaceSettings } from '../types';
import { Save, Info } from 'lucide-react';

interface Props {
  store: WorkspaceStore;
  updateStore: (updater: (prev: WorkspaceStore) => WorkspaceStore) => void;
}

const Settings: React.FC<Props> = ({ store, updateStore }) => {
  const [formData, setFormData] = useState<WorkspaceSettings>(store.settings);

  const handleSave = () => {
    updateStore(prev => ({ ...prev, settings: formData }));
    alert('Cài đặt đã được lưu!');
  };

  return (
    <div className="max-w-3xl space-y-8 text-gray-900">
      <div>
        <h2 className="text-2xl font-bold">Cài đặt cơ sở</h2>
        <p className="text-gray-500 text-sm">Thiết lập đơn giá, định mức và thông tin thanh toán.</p>
      </div>

      <div className="bg-white border rounded-3xl p-8 shadow-sm space-y-8">
        <section className="space-y-4">
          <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-3 uppercase text-sm tracking-widest">Đơn giá dịch vụ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Giá điện (đ/kWh)</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                value={formData.electricityPrice} 
                onChange={e => setFormData({...formData, electricityPrice: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Giá nước/người lớn (đ)</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                value={formData.waterAdultPrice} 
                onChange={e => setFormData({...formData, waterAdultPrice: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Giá nước/trẻ em (đ)</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                value={formData.waterChildPrice} 
                onChange={e => setFormData({...formData, waterChildPrice: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Phí sinh hoạt/người lớn (đ)</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                value={formData.livingFeePerAdult} 
                onChange={e => setFormData({...formData, livingFeePerAdult: Number(e.target.value)})} 
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-3 uppercase text-sm tracking-widest">Quy trình hóa đơn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Hạn nộp tiền (Ngày 1-28)</label>
              <input 
                type="number" 
                min="1" 
                max="28" 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                value={formData.defaultDueDay} 
                onChange={e => setFormData({...formData, defaultDueDay: Number(e.target.value)})} 
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input 
                type="checkbox" 
                className="w-6 h-6 border-gray-300 rounded cursor-pointer accent-blue-600 bg-white" 
                checked={formData.allowInvoiceWithoutElectric} 
                onChange={e => setFormData({...formData, allowInvoiceWithoutElectric: e.target.checked})} 
                id="allowElec" 
              />
              <label htmlFor="allowElec" className="text-sm font-bold text-gray-800 cursor-pointer">Cho phép lập hóa đơn khi thiếu số điện</label>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-3 uppercase text-sm tracking-widest">Thông tin chuyển khoản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Tên ngân hàng</label>
              <input 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400" 
                value={formData.bankName} 
                onChange={e => setFormData({...formData, bankName: e.target.value})} 
                placeholder="VD: Vietcombank" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Số tài khoản</label>
              <input 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 font-bold font-mono outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                value={formData.bankAccount} 
                onChange={e => setFormData({...formData, bankAccount: e.target.value})} 
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold uppercase text-gray-500">Họ và tên chủ thẻ</label>
              <input 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                value={formData.bankOwner} 
                onChange={e => setFormData({...formData, bankOwner: e.target.value})} 
              />
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400 italic">
            <Info size={14} /> Dữ liệu được lưu cục bộ trên trình duyệt này.
          </div>
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Save size={20} /> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
