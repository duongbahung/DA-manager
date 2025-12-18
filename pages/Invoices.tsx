
import React, { useState } from 'react';
import { WorkspaceStore, Invoice, InvoiceStatus, LeaseStatus, InvoiceLine } from '../types';
import { Plus, Receipt, Search, FileText, CheckCircle, Clock, Copy, Trash2, X } from 'lucide-react';

interface Props {
  store: WorkspaceStore;
  updateStore: (updater: (prev: WorkspaceStore) => WorkspaceStore) => void;
}

const Invoices: React.FC<Props> = ({ store, updateStore }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const generateBatch = () => {
    const activeLeases = store.leases.filter(l => l.status === LeaseStatus.Active);
    if (activeLeases.length === 0) return alert('Không có hợp đồng hiệu lực nào để lập hóa đơn!');

    const results: Invoice[] = [];
    const logs: string[] = [];

    activeLeases.forEach(lease => {
      // Check if already exists
      const exists = store.invoices.find(inv => inv.unitId === lease.unitId && inv.month === selectedMonth);
      if (exists) return;

      const electric = store.electricReadings.find(r => r.unitId === lease.unitId && r.month === selectedMonth);
      const settings = store.settings;

      if (!electric && !settings.allowInvoiceWithoutElectric) {
        logs.push(`Phòng ${store.units.find(u => u.id === lease.unitId)?.name}: Thiếu số điện, đã bỏ qua.`);
        return;
      }

      const lines: InvoiceLine[] = [
        { label: 'Tiền thuê phòng', amount: lease.rentMonthly },
        { label: `Nước (Người lớn: ${lease.adults}x${settings.waterAdultPrice.toLocaleString()})`, amount: lease.adults * settings.waterAdultPrice },
        { label: `Nước (Trẻ em: ${lease.children}x${settings.waterChildPrice.toLocaleString()})`, amount: lease.children * settings.waterChildPrice },
        { label: `Phí sinh hoạt (Người lớn: ${lease.adults}x${settings.livingFeePerAdult.toLocaleString()})`, amount: lease.adults * settings.livingFeePerAdult },
      ];

      if (electric) {
        lines.push({ label: `Điện (${electric.kwh}kWh x ${settings.electricityPrice.toLocaleString()})`, amount: electric.kwh * settings.electricityPrice });
      }

      const total = lines.reduce((acc, l) => acc + l.amount, 0);
      const dueDate = `${selectedMonth}-${String(settings.defaultDueDay).padStart(2, '0')}`;

      results.push({
        id: crypto.randomUUID(),
        unitId: lease.unitId,
        leaseId: lease.id,
        month: selectedMonth,
        dueDate,
        lines,
        total,
        paid: 0,
        remaining: total,
        status: InvoiceStatus.Unpaid,
        missingElectric: !electric
      });
    });

    if (results.length > 0) {
      updateStore(prev => ({ ...prev, invoices: [...prev.invoices, ...results] }));
      alert(`Đã lập ${results.length} hóa đơn.`);
    }
    if (logs.length > 0) alert(logs.join('\n'));
  };

  const deleteInvoice = (id: string) => {
    if (confirm('Xóa hóa đơn này? Các khoản thanh toán liên quan sẽ bị mồ côi.')) {
      updateStore(prev => ({ ...prev, invoices: prev.invoices.filter(i => i.id !== id) }));
    }
  };

  const getReminderText = (invoice: Invoice, template: 'before' | 'today' | 'overdue' | 'partial') => {
    const unit = store.units.find(u => u.id === invoice.unitId);
    const tenant = store.tenants.find(t => t.id === store.leases.find(l => l.id === invoice.leaseId)?.tenantId);
    const s = store.settings;
    
    let base = `Chào bạn ${tenant?.fullName}, đây là thông báo tiền phòng ${unit?.name} tháng ${invoice.month}:\n`;
    base += `Tổng tiền: ${invoice.total.toLocaleString()}đ\n`;
    base += `Đã trả: ${invoice.paid.toLocaleString()}đ\n`;
    base += `Còn lại: ${invoice.remaining.toLocaleString()}đ\n`;
    base += `Hạn thanh toán: ${invoice.dueDate}\n\n`;
    base += `Số TK: ${s.bankAccount}\n`;
    base += `Ngân hàng: ${s.bankName}\n`;
    base += `Chủ TK: ${s.bankOwner}\n\n`;

    switch(template) {
      case 'before': return base + 'Bạn vui lòng thanh toán đúng hạn nhé. Cảm ơn bạn!';
      case 'today': return base + 'Hôm nay là hạn cuối thanh toán, bạn để ý chuyển khoản giúp mình nha!';
      case 'overdue': return base + 'Khoản phí này hiện đã quá hạn. Bạn vui lòng thanh toán ngay trong ngày hôm nay.';
      case 'partial': return base + 'Bạn còn thiếu một phần tiền phòng, vui lòng bổ sung sớm nhé.';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy mẫu nhắc nợ!');
  };

  const filteredInvoices = store.invoices.filter(i => i.month === selectedMonth);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Quản lý hóa đơn</h2>
          <p className="text-gray-500 text-sm">Tự động tính toán tiền phòng và dịch vụ hàng tháng.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="month" 
            className="border rounded-xl px-4 py-2" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)} 
          />
          <button 
            onClick={generateBatch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <Receipt size={18} /> Lập hóa đơn loạt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvoices.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl text-gray-400">
            Chưa có hóa đơn nào cho tháng này. Bấm "Lập hóa đơn loạt" để tạo nhanh.
          </div>
        )}
        {filteredInvoices.map(inv => {
          const unit = store.units.find(u => u.id === inv.unitId);
          return (
            <div key={inv.id} className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    inv.status === InvoiceStatus.Paid ? 'bg-green-100 text-green-600' : 
                    inv.status === InvoiceStatus.Overdue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{unit?.name}</h3>
                    <p className="text-xs text-gray-500">Hạn: {inv.dueDate}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                  inv.status === InvoiceStatus.Paid ? 'bg-green-100 text-green-700' : 
                  inv.status === InvoiceStatus.Overdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {inv.status}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-gray-500">Tổng thu:</span>
                  <span className="text-lg font-black">{inv.total.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 italic">{inv.paid > 0 ? `Đã trả: ${inv.paid.toLocaleString()}đ` : 'Chưa trả'}</span>
                  {inv.remaining > 0 && <span className="font-bold text-red-500">Còn: {inv.remaining.toLocaleString()}đ</span>}
                </div>
              </div>

              {inv.missingElectric && (
                <div className="bg-red-50 text-red-600 p-2 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <Clock size={12} /> HÓA ĐƠN CHƯA CÓ TIỀN ĐIỆN
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <button onClick={() => setViewingInvoice(inv)} className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  <FileText size={14} /> Chi tiết
                </button>
                <button onClick={() => deleteInvoice(inv.id)} className="p-2 border rounded-xl text-red-600 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {viewingInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold">Chi tiết hóa đơn</h3>
              <button onClick={() => setViewingInvoice(null)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-gray-400">Các hạng mục</h4>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  {viewingInvoice.lines.map((l, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{l.label}</span>
                      <span className="font-medium">{l.amount.toLocaleString()}đ</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-black text-blue-600">
                    <span>TỔNG CỘNG</span>
                    <span>{viewingInvoice.total.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-gray-400">Nhắc nhở thanh toán (Copy)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => copyToClipboard(getReminderText(viewingInvoice, 'before'))} className="p-3 border rounded-xl text-xs font-bold hover:bg-blue-50 flex flex-col items-center gap-1">
                    <Clock size={16} /> Nhắc trước hạn
                  </button>
                  <button onClick={() => copyToClipboard(getReminderText(viewingInvoice, 'today'))} className="p-3 border rounded-xl text-xs font-bold hover:bg-amber-50 flex flex-col items-center gap-1 text-amber-600">
                    <CheckCircle size={16} /> Nhắc hôm nay
                  </button>
                  <button onClick={() => copyToClipboard(getReminderText(viewingInvoice, 'overdue'))} className="p-3 border rounded-xl text-xs font-bold hover:bg-red-50 flex flex-col items-center gap-1 text-red-600">
                    <Clock size={16} /> Nhắc quá hạn
                  </button>
                  <button onClick={() => copyToClipboard(getReminderText(viewingInvoice, 'partial'))} className="p-3 border rounded-xl text-xs font-bold hover:bg-slate-50 flex flex-col items-center gap-1 text-slate-600">
                    <Copy size={16} /> Nhắc thiếu tiền
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
