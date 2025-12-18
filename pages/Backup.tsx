
import React from 'react';
import { WorkspaceId, WorkspaceStore } from '../types';
import { Download, Upload, ShieldAlert } from 'lucide-react';

interface Props {
  workspaceId: WorkspaceId;
  store: WorkspaceStore;
  saveStore: (newStore: WorkspaceStore) => void;
}

const Backup: React.FC<Props> = ({ workspaceId, store, saveStore }) => {
  const handleExport = () => {
    const dataStr = JSON.stringify(store, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `apops_backup_${workspaceId}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('HÀNH ĐỘNG NÀY SẼ GHI ĐÈ TOÀN BỘ DỮ LIỆU HIỆN TẠI CỦA CƠ SỞ NÀY. Bạn có chắc chắn?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        saveStore(json);
        alert('Nhập dữ liệu thành công!');
        window.location.reload();
      } catch (err) {
        alert('Lỗi định dạng file JSON!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Sao lưu & Phục hồi</h2>
        <p className="text-gray-500 text-sm">Xuất dữ liệu ra file JSON hoặc nhập dữ liệu từ file có sẵn.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border rounded-3xl p-8 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Download size={24} />
          </div>
          <h3 className="text-xl font-bold">Xuất dữ liệu</h3>
          <p className="text-gray-500 text-sm">Tải về toàn bộ thông tin của cơ sở hiện tại (Phòng, Khách, Hợp đồng, Hóa đơn...) dưới dạng file .json.</p>
          <button 
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all w-full sm:w-auto"
          >
            Tải về bản sao lưu
          </button>
        </div>

        <div className="bg-white border rounded-3xl p-8 shadow-sm space-y-4 border-red-100">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <Upload size={24} />
          </div>
          <h3 className="text-xl font-bold">Nhập dữ liệu</h3>
          <p className="text-gray-500 text-sm">Chọn một file sao lưu .json để ghi đè vào hệ thống. Hành động này không thể hoàn tác.</p>
          
          <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 border border-red-100">
            <ShieldAlert className="text-red-600 shrink-0" size={20} />
            <p className="text-xs text-red-700 leading-relaxed font-medium">
              Cảnh báo: Dữ liệu hiện tại của cơ sở này sẽ biến mất hoàn toàn và được thay thế bằng dữ liệu trong file.
            </p>
          </div>

          <label className="block">
            <span className="sr-only">Chọn file backup</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Backup;
