
import React, { useState, useMemo } from 'react';
import { WorkspaceId } from './types';
import { useWorkspace } from './hooks/useWorkspace';
import { WORKSPACES } from './constants';
import { 
  LayoutDashboard, 
  DoorOpen, 
  Users, 
  FileText, 
  Zap, 
  Receipt, 
  CreditCard, 
  Wrench, 
  Settings as SettingsIcon, 
  Database,
  Menu,
  ChevronDown
} from 'lucide-react';

// Pages
import Dashboard from './pages/Dashboard';
import Units from './pages/Units';
import Tenants from './pages/Tenants';
import Leases from './pages/Leases';
import Electric from './pages/Electric';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Settings from './pages/Settings';
import Backup from './pages/Backup';

type Page = 'dashboard' | 'units' | 'tenants' | 'leases' | 'electric' | 'invoices' | 'payments' | 'maintenance' | 'settings' | 'backup';

const App: React.FC = () => {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<WorkspaceId>('A');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { store, updateStore, saveStore } = useWorkspace(currentWorkspaceId);

  const currentWorkspaceName = useMemo(() => 
    WORKSPACES.find(w => w.id === currentWorkspaceId)?.name || '', 
    [currentWorkspaceId]
  );

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' as Page },
    { name: 'Phòng (Units)', icon: DoorOpen, id: 'units' as Page },
    { name: 'Khách (Tenants)', icon: Users, id: 'tenants' as Page },
    { name: 'Hợp đồng (Leases)', icon: FileText, id: 'leases' as Page },
    { name: 'Điện (Electric)', icon: Zap, id: 'electric' as Page },
    { name: 'Hóa đơn (Invoices)', icon: Receipt, id: 'invoices' as Page },
    { name: 'Thanh toán (Payments)', icon: CreditCard, id: 'payments' as Page },
    { name: 'Sửa chữa (Maint.)', icon: Wrench, id: 'maintenance' as Page },
    { name: 'Cài đặt (Settings)', icon: SettingsIcon, id: 'settings' as Page },
    { name: 'Sao lưu (Backup)', icon: Database, id: 'backup' as Page },
  ];

  const renderPage = () => {
    const props = { store, updateStore, saveStore };
    switch (currentPage) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'units': return <Units {...props} />;
      case 'tenants': return <Tenants {...props} />;
      case 'leases': return <Leases {...props} />;
      case 'electric': return <Electric {...props} />;
      case 'invoices': return <Invoices {...props} />;
      case 'payments': return <Payments {...props} />;
      case 'maintenance': return <Maintenance {...props} />;
      case 'settings': return <Settings {...props} />;
      case 'backup': return <Backup {...props} workspaceId={currentWorkspaceId} />;
      default: return <Dashboard {...props} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-slate-900 text-white flex flex-col shrink-0`}>
        <div className="p-6 font-bold text-xl flex items-center gap-2 truncate">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shrink-0">D</div>
          {isSidebarOpen && <span>AP-Ops Lite</span>}
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                currentPage === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
              {navigation.find(n => n.id === currentPage)?.name}
            </h1>
          </div>

          {/* Workspace Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-full text-sm font-semibold border">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              {currentWorkspaceName}
              <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl hidden group-hover:block z-50">
              <div className="p-2 text-xs text-gray-400 font-bold uppercase tracking-wider">Chọn cơ sở</div>
              {WORKSPACES.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspaceId(ws.id);
                    setCurrentPage('dashboard');
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between ${
                    currentWorkspaceId === ws.id ? 'bg-blue-50 text-blue-600 font-bold' : ''
                  }`}
                >
                  {ws.name}
                  {currentWorkspaceId === ws.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
