
import React, { useState } from 'react';
import { WorkspaceStore, Payment, InvoiceStatus, Tenant } from '../types';
import { Plus, CreditCard, Trash2, X, Search, Wallet } from 'lucide-react';

interface Props {
  store: WorkspaceStore;
  updateStore: (updater: (prev: WorkspaceStore) => WorkspaceStore) => void;
}

const Payments: React.FC<Props> = ({ store, updateStore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Payment>>({
    invoiceId: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    method: 'Bank',
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceId || !formData.amount) return alert('Dữ liệu không hợp lệ!');

    updateStore(prev => {
      const invoice = prev.invoices.find(i => i.id === formData.invoiceId);
      const lease = prev.leases.find(l => l.id === invoice?.leaseId);
      const tenantId = lease?.tenantId;

      if (!invoice || !tenantId) return prev;

      const paymentAmount = Number(formData.amount);
      const remainingOnInvoice = invoice.remaining;
      const surplus = paymentAmount > remainingOnInvoice ? paymentAmount - remainingOnInvoice : 0;
      const actualAppliedToInvoice = paymentAmount > remainingOnInvoice ? remainingOnInvoice : paymentAmount;

      const newPayment: Payment = {
        id: crypto.randomUUID(),
        invoiceId: formData.invoiceId!,
        date: formData.date!,
        amount: paymentAmount,
        method: formData.method as any,
        note: formData.note || (surplus > 0 ? `Bao gồm ${surplus.toLocaleString()}đ tiền thừa nạp vào số dư` : '')
      };

      // Update invoice
      const updatedInvoices = prev.invoices.map(inv => {
        if (inv.id === newPayment.invoiceId) {
          const newPaid = inv.paid + actualAppliedToInvoice;
          const newRemaining = Math.max(0, inv.total - newPaid);
          let newStatus = inv.status;

          if (newRemaining <= 0) newStatus = InvoiceStatus.Paid;
          else if (newPaid > 0) newStatus = InvoiceStatus.Partial;
          
          return { ...inv, paid: newPaid, remaining: newRemaining, status: newStatus };
        }
        return inv;
      });

      // Update tenant balance if there's a surplus
      const updatedTenants = prev.tenants.map(t => {
        if (t.id === tenantId && surplus > 0) {
          return { ...t, creditBalance: (t.creditBalance || 0) + surplus };
        }
        return t;
      });

      return { 
        ...prev, 
        payments: [newPayment, ...prev.payments], 
        invoices: updatedInvoices,
        tenants: updatedTenants
      };
    });

    setIsModalOpen(false);
  };

  const deletePayment = (id: string) => {
    if (!confirm('Xóa thanh toán này? Nếu thanh toán có phần nạp vào số dư khách, bạn cần điều chỉnh số dư khách thủ công trong trang Khách thuê.')) return;
    updateStore(prev => {
      const p = prev.payments.find(pm => pm.id === id);
      if (!p) return prev;

      const updatedInvoices = prev.invoices.map(inv => {
        if (inv.id === p.invoiceId) {
          // Note: This simple LITE logic assumes only the invoice portion is reverted here.
          // For a true system we'd track invoice-portion vs surplus-portion.
          // In Lite, we revert the amount up to the invoice total.
          const amountToRevert = Math.min(p.amount, inv.paid);
          const newPaid = inv.paid - amountToRevert;
          const newRemaining = inv.total - newPaid;
          let newStatus = inv.status;
          if (newPaid <= 0) newStatus = InvoiceStatus.Unpaid;
          else if (newRemaining > 0) newStatus = InvoiceStatus.Partial;
          else newStatus = InvoiceStatus.Paid;
          return { ...inv, paid: newPaid, remaining: newRemaining, status: newStatus };
        }
        return inv;
      });

      return { ...prev, payments: prev.payments.filter(pm => pm.id !== id), invoices: updatedInvoices };
    });
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h2>
          <p className="text-gray-500 text-sm">Ghi nhận tiền thu. Nếu thu thừa sẽ nạp vào số dư khách.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus size={18} /> Ghi thanh toán
        </button>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Ngày</th>
                <th className="px-6 py-4 font-semibold">Hóa đơn (Phòng)</th>
                <th className="px-6 py-4 font-semibold">Số tiền thu</th>
                <th className="px-6 py-4 font-semibold">Hình thức</th>
                <th className="px-6 py-4 font-semibold">Ghi chú</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {store.payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Chưa có giao dịch nào.</td>
                </tr>
              )}
              {store.payments.map(payment => {
                const invoice = store.invoices.find(i => i.id === payment.invoiceId);
                const unit = store.units.find(u => u.id === invoice?.unitId);
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 text-gray-900">
                    <td className="px-6 py-4">{payment.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{unit?.name || 'Đã xóa'}</span>
                        <span className="text-xs text-gray-500 font-medium">Tháng {invoice?.month}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-green-700">{payment.amount.toLocaleString()}đ</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${payment.method === 'Bank' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {payment.method === 'Bank' ? 'Chuyển khoản' : 'Tiền mặt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 italic text-gray-600 line-clamp-1 max-w-[200px]">{payment.note}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deletePayment(payment.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
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
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Ghi nhận thanh toán</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100 mb-2">
                <Wallet className="text-blue-600 shrink-0" size={18} />
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  Lưu ý: Nếu số tiền thu lớn hơn số tiền hóa đơn còn nợ, phần chênh lệch sẽ tự động cộng vào <b>Số dư tiền thừa</b> của khách.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Chọn hóa đơn</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.invoiceId} 
                  onChange={e => {
                    const inv = store.invoices.find(i => i.id === e.target.value);
                    setFormData({ ...formData, invoiceId: e.target.value, amount: inv?.remaining || 0 });
                  }}
                >
                  <option value="">-- Chọn hóa đơn chưa trả xong --</option>
                  {store.invoices.filter(i => i.status !== InvoiceStatus.Paid).map(inv => {
                    const unit = store.units.find(u => u.id === inv.unitId);
                    return <option key={inv.id} value={inv.id}>{unit?.name} (T{inv.month}) - Còn nợ: {inv.remaining.toLocaleString()}đ</option>;
                  })}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Ngày thu</label>
                <input type="date" className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Số tiền thu thực tế (đ)</label>
                <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-green-700 font-black outline-none focus:ring-2 focus:ring-blue-500 text-lg" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                <p className="text-[10px] text-gray-400 italic">Nhập 15.000.000đ nếu khách đóng tiền 3 tháng (ví dụ 5tr/tháng)</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Hình thức</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFormData({...formData, method: 'Bank'})} className={`flex-1 py-2 rounded-xl border font-bold text-sm transition-all ${formData.method === 'Bank' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-300'}`}>Chuyển khoản</button>
                  <button type="button" onClick={() => setFormData({...formData, method: 'Cash'})} className={`flex-1 py-2 rounded-xl border font-bold text-sm transition-all ${formData.method === 'Cash' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-500 border-gray-300'}`}>Tiền mặt</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Ghi chú</label>
                <input className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} placeholder="VD: Khách đóng trước 3 tháng" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md transition-all active:scale-95">Lưu thanh toán</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
