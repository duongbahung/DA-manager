
import React from 'react';
import { WorkspaceStore, UnitStatus, LeaseStatus, InvoiceStatus } from '../types';
import { DoorOpen, Users, Receipt, AlertCircle } from 'lucide-react';

interface Props {
  store: WorkspaceStore;
}

const Dashboard: React.FC<Props> = ({ store }) => {
  const { units, tenants, leases, invoices, maintenance } = store;

  const stats = [
    { 
      label: 'Tổng số phòng', 
      value: units.length, 
      sub: `${units.filter(u => u.status === UnitStatus.Occupied).length} Đã thuê`,
      icon: DoorOpen, 
      color: 'blue' 
    },
    { 
      label: 'Tổng số khách', 
      value: tenants.length, 
      sub: `${leases.filter(l => l.status === LeaseStatus.Active).length} Hợp đồng hiệu lực`,
      icon: Users, 
      color: 'green' 
    },
    { 
      label: 'Công nợ chưa thu', 
      value: invoices
        .filter(inv => inv.status !== InvoiceStatus.Paid)
        .reduce((acc, inv) => acc + inv.remaining, 0)
        .toLocaleString() + 'đ', 
      sub: `${invoices.filter(inv => inv.status === InvoiceStatus.Unpaid).length} Hóa đơn chưa thanh toán`,
      icon: Receipt, 
      color: 'amber' 
    },
    { 
      label: 'Yêu cầu bảo trì', 
      value: maintenance.filter(m => m.status !== 'Completed').length, 
      sub: 'Đang chờ xử lý',
      icon: AlertCircle, 
      color: 'red' 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-900">Tổng quan quản lý</h2>
        <p className="text-gray-500 text-sm">Chào mừng bạn trở lại! Dưới đây là trạng thái hiện tại của cơ sở này.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Trạng thái phòng</h3>
          <div className="space-y-3">
            {[UnitStatus.Vacant, UnitStatus.Occupied, UnitStatus.Maintenance].map(status => {
              const count = units.filter(u => u.status === status).length;
              const pct = units.length ? (count / units.length) * 100 : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{status === 'Vacant' ? 'Phòng trống' : status === 'Occupied' ? 'Đã ở' : 'Đang sửa'}</span>
                    <span className="font-bold">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${status === 'Vacant' ? 'bg-green-500' : status === 'Occupied' ? 'bg-blue-500' : 'bg-red-500'}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Nhắc nhở công việc</h3>
          <ul className="space-y-4">
            {maintenance.filter(m => m.status !== 'Completed').length === 0 && (
              <li className="text-sm text-gray-400 italic">Không có yêu cầu bảo trì nào.</li>
            )}
            {maintenance.filter(m => m.status !== 'Completed').slice(0, 5).map(m => (
              <li key={m.id} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full ${m.priority === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{m.description}</p>
                  <p className="text-xs text-gray-500">Đơn vị: {units.find(u => u.id === m.unitId)?.name || 'N/A'}</p>
                </div>
                <div className="text-xs font-bold text-gray-400">Hạn: {m.slaDueDate}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
