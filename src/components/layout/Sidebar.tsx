import React from 'react';
import {
  Home,
  LayoutDashboard,
  Users,
  BadgeDollarSign,
  ShoppingCart,
  Package,
  Layers,
  Receipt,
  BookOpen,
  Contact,
  Shirt,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  ArrowRightLeft,
  Truck,
  RotateCcw,
  CreditCard,
  FileText,
  Lock,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { AppModuleId } from '../../types/erp';

export const Sidebar: React.FC = () => {
  const {
    activeApp,
    setActiveApp,
    activeView,
    setActiveView,
    checkRoleAccess,
    currentUser,
    addNotification,
  } = useERP();

  // Primary Applications list matching storyboard sketch S-02 through S-16
  const apps: {
    id: AppModuleId;
    label: string;
    screenCode: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultView?: string;
    subViews?: { id: string; label: string; screenCode?: string; icon: React.ComponentType<{ className?: string }> }[];
  }[] = [
    {
      id: 'home',
      label: 'Home',
      screenCode: 'S-02',
      icon: Home,
      defaultView: 'overview',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      screenCode: 'S-03',
      icon: LayoutDashboard,
      defaultView: 'overview',
    },
    {
      id: 'crm',
      label: 'CRM',
      screenCode: 'S-04',
      icon: Users,
      defaultView: 'kanban',
    },
    {
      id: 'sales',
      label: 'Sales',
      screenCode: 'S-05',
      icon: BadgeDollarSign,
      defaultView: 'quotations',
    },
    {
      id: 'pos',
      label: 'Point of sale',
      screenCode: 'S-14',
      icon: ShoppingCart,
      defaultView: 'pos_checkout',
    },
    {
      id: 'purchase',
      label: 'Purchase',
      screenCode: 'S-08',
      icon: Package,
      defaultView: 'po_list',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      screenCode: 'S-07',
      icon: Layers,
      defaultView: 'stock_overview',
      subViews: [
        { id: 'stock_overview', label: 'Stock Overview', screenCode: 'S-07', icon: Layers },
        { id: 'delivery_orders', label: 'Delivery Order', screenCode: 'S-06', icon: Truck },
        { id: 'receipts', label: 'Quality Acceptance', screenCode: 'S-09', icon: Package },
        { id: 'returns', label: 'Customer Returns', screenCode: 'S-15', icon: RotateCcw },
        { id: 'transfers', label: 'Internal Transfers', icon: ArrowRightLeft },
      ],
    },
    {
      id: 'accounting',
      label: 'Accounting',
      screenCode: 'S-13',
      icon: BookOpen,
      defaultView: 'journals',
      subViews: [
        { id: 'journals', label: 'Journal Entries', screenCode: 'S-13', icon: BookOpen },
        { id: 'vendor_bills', label: 'Vendor Bill', screenCode: 'S-11', icon: Receipt },
        { id: 'register_payment', label: 'Register Payment', screenCode: 'S-12', icon: CreditCard },
        { id: 'ledger', label: 'General Ledger', icon: FileText },
      ],
    },
    {
      id: 'invoicing',
      label: 'Invoicing',
      screenCode: 'S-10',
      icon: Receipt,
      defaultView: 'invoices',
      subViews: [
        { id: 'invoices', label: 'Customer Invoice', screenCode: 'S-10', icon: Receipt },
        { id: 'credit_notes', label: 'Credit Note', screenCode: 'S-15', icon: RotateCcw },
      ],
    },
    {
      id: 'contacts',
      label: 'Contacts',
      screenCode: 'S-02',
      icon: Contact,
      defaultView: 'all_contacts',
    },
    {
      id: 'products',
      label: 'Products',
      screenCode: 'S-03',
      icon: Shirt,
      defaultView: 'variants',
    },
    {
      id: 'reporting',
      label: 'Reporting',
      screenCode: 'S-16',
      icon: BarChart3,
      defaultView: 'sales_report',
    },
    {
      id: 'settings',
      label: 'Settings',
      screenCode: 'CFG',
      icon: Settings,
      defaultView: 'company_profile',
    },
    {
      id: 'audit',
      label: 'Audit Log',
      screenCode: 'LOG',
      icon: ShieldCheck,
      defaultView: 'audit_logs',
    },
  ];

  const handleSelectApp = (appId: AppModuleId, defaultView?: string) => {
    const isAllowed = checkRoleAccess(appId);
    if (!isAllowed) {
      addNotification('error', `Akses modul "${appId}" dibatasi untuk role ${currentUser?.roleName} (SR-16).`);
      return;
    }
    setActiveApp(appId);
    if (defaultView) {
      setActiveView(defaultView);
    }
  };

  return (
    <aside className="w-60 bg-[#1E1E1E] text-[#D5CEBF] flex flex-col border-r border-[#2A2A2A] shrink-0 select-none hidden md:flex">
      {/* Brand & Workspace Title Banner */}
      <div className="px-4 py-3 border-b border-[#2A2A2A] bg-[#171717] flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#C18B42]">
            PT Rona Karsa
          </div>
          <div className="text-xs font-bold text-white mt-0.5">Fashion Apparel ERP</div>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#242424] text-[#A6A29A] border border-[#333333]">
          v17.0
        </span>
      </div>

      {/* Main Apps List matching Storyboard Sidebar */}
      <div className="p-2 space-y-0.5 flex-1 overflow-y-auto">
        {apps.map((app) => {
          const Icon = app.icon;
          const isSelected = activeApp === app.id;
          const isAllowed = checkRoleAccess(app.id);

          return (
            <div key={app.id} className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleSelectApp(app.id, app.defaultView)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors group ${
                  isSelected
                    ? 'bg-[#2E2E2E] text-white shadow-xs border border-[#3E3E3E]'
                    : isAllowed
                    ? 'text-[#C7C3BB] hover:bg-[#252525] hover:text-white'
                    : 'text-[#6E6B65] opacity-50 cursor-not-allowed hover:bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected
                        ? 'text-[#C18B42]'
                        : isAllowed
                        ? 'text-[#8C8983] group-hover:text-white'
                        : 'text-[#555555]'
                    }`}
                  />
                  <span className="truncate">{app.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isAllowed ? (
                    <Lock className="w-3 h-3 text-[#B94B4B]" />
                  ) : (
                    <span
                      className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                        isSelected
                          ? 'bg-[#C18B42] text-black font-bold'
                          : 'bg-[#292929] text-[#8C8983] group-hover:text-[#D5CEBF]'
                      }`}
                    >
                      {app.screenCode}
                    </span>
                  )}
                  {app.subViews && isSelected && (
                    <ChevronDown className="w-3 h-3 text-[#C18B42]" />
                  )}
                </div>
              </button>

              {/* Sub-views accordion if this app is currently active and has subviews */}
              {app.subViews && isSelected && (
                <div className="ml-5 pl-2 border-l border-[#333333] space-y-0.5 my-1">
                  {app.subViews.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeView === sub.id;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setActiveView(sub.id)}
                        className={`w-full text-left px-2 py-1 rounded-md text-[11px] flex items-center justify-between transition-colors ${
                          isSubActive
                            ? 'bg-[#383838] text-white font-semibold'
                            : 'text-[#A6A29A] hover:bg-[#292929] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <SubIcon
                            className={`w-3 h-3 ${
                              isSubActive ? 'text-[#C18B42]' : 'text-[#8C8983]'
                            }`}
                          />
                          <span className="truncate">{sub.label}</span>
                        </div>
                        {sub.screenCode && (
                          <span className="text-[8.5px] font-mono text-[#8C8983]">
                            {sub.screenCode}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warehouse and store status footer */}
      <div className="p-3 border-t border-[#2A2A2A] bg-[#171717] text-[11px] text-[#8C8983] space-y-1">
        <div className="flex items-center justify-between">
          <span>Gudang Jakarta:</span>
          <span className="font-mono text-white text-[10px]">WH-JKT</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Toko Bandung:</span>
          <span className="font-mono text-white text-[10px]">STORE-BDG</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-[#242424]">
          <span>Tarif Pajak:</span>
          <span className="font-mono text-[#54745B] text-[10px]">PPN Efektif 11%</span>
        </div>
      </div>
    </aside>
  );
};
