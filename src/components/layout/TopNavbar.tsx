import React, { useState } from 'react';
import {
  Grid,
  Search,
  Bell,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Building2,
  LogOut,
  ShieldAlert,
  Eye,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { UserRole, AppModuleId } from '../../types/erp';

interface TopNavbarProps {
  onOpenStoryboard?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = () => {
  const {
    currentUser,
    setCurrentUser,
    switchRole,
    activeApp,
    setActiveApp,
    appSwitcherOpen,
    setAppSwitcherOpen,
    resetToBaselineSeed,
  } = useERP();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const appNames: Record<AppModuleId, string> = {
    home: 'Home / App Switcher (S-02)',
    dashboard: 'Business Overview (S-03 / S-16)',
    crm: 'CRM Pipeline (S-04)',
    sales: 'Sales & Orders (S-05)',
    pos: 'Point of Sale Retail (S-14)',
    purchase: 'Purchase & RFQ (S-08)',
    inventory: 'Inventory & Logistics (S-07)',
    invoicing: 'Customer Invoices (S-10)',
    accounting: 'Accounting & Ledger (S-13)',
    contacts: 'Form Contacts (S-02)',
    products: 'Products & Variants (S-03)',
    reporting: 'Analytics & Reporting',
    settings: 'Company Settings',
    audit: 'Audit Log & History',
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('pos') || q.includes('kasir')) setActiveApp('pos');
    else if (q.includes('so') || q.includes('sales') || q.includes('s00007')) setActiveApp('sales');
    else if (q.includes('po') || q.includes('purchase') || q.includes('beli')) setActiveApp('purchase');
    else if (q.includes('inv') || q.includes('faktur')) setActiveApp('invoicing');
    else if (q.includes('jurnal') || q.includes('ledger') || q.includes('akuntansi')) setActiveApp('accounting');
    else if (q.includes('stok') || q.includes('gudang') || q.includes('delivery')) setActiveApp('inventory');
    else if (q.includes('retur') || q.includes('credit note')) setActiveApp('inventory');
    else if (q.includes('crm') || q.includes('lead')) setActiveApp('crm');
    else if (q.includes('kontak') || q.includes('customer')) setActiveApp('contacts');
    else setActiveApp('products');
  };

  return (
    <header className="h-13 bg-[#171717] text-[#FFFEFC] px-4 flex items-center justify-between border-b border-[#242424] select-none z-30 sticky top-0">
      {/* Left zone: App Switcher & App Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setAppSwitcherOpen(!appSwitcherOpen)}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            appSwitcherOpen ? 'bg-[#2E2E2E] text-white' : 'text-[#D5CEBF] hover:bg-[#242424] hover:text-white'
          }`}
          title="Odoo App Switcher"
          aria-label="App Switcher"
        >
          <Grid className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-wide text-white">PT Rona Karsa Apparel</span>
          <span className="text-[#8C8983] text-xs">/</span>
          <span className="text-xs text-[#E8E4DE] font-medium tracking-wide">
            {appNames[activeApp] || 'ERP'}
          </span>
        </div>
      </div>

      {/* Middle zone: Global Search & Quick Actions */}
      <div className="hidden md:flex items-center gap-3 max-w-md w-full mx-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8983]" />
          <input
            type="text"
            placeholder="Cari dokumen (S00007, PO00007), SKU (AP-TS-BLK-M), pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#242424] text-xs text-[#FFFEFC] pl-8 pr-3 py-1.5 rounded-md border border-[#333333] focus:outline-none focus:border-[#D5CEBF] placeholder:text-[#6E6B65] transition-colors"
          />
        </form>
      </div>

      {/* Right zone: Baseline Reset, Company info, Role Switcher */}
      <div className="flex items-center gap-2">
        {/* Reset Baseline Seed */}
        <button
          onClick={() => {
            if (confirm('Reset seluruh data ke baseline seed awal (106 unit total, Rp11.140.000 persediaan)?')) {
              resetToBaselineSeed();
            }
          }}
          className="p-1.5 text-xs rounded-md text-[#D5CEBF] hover:bg-[#242424] hover:text-white transition-colors"
          title="Reset ke Baseline Seed 106 Unit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Company indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 text-[11px] text-[#A6A29A] bg-[#1E1E1E] rounded border border-[#2E2E2E]">
          <Building2 className="w-3 h-3 text-[#C18B42]" />
          <span>WH-JKT & STORE-BDG</span>
        </div>

        {/* Role Selector dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs bg-[#242424] hover:bg-[#2E2E2E] rounded-md border border-[#333333] transition-colors text-white"
          >
            <div className="w-5 h-5 rounded bg-[#C18B42] text-black font-semibold text-[10px] flex items-center justify-center uppercase">
              {currentUser?.role.slice(0, 2)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-medium text-xs leading-none">{currentUser?.name}</div>
              <div className="text-[10px] text-[#A6A29A] leading-none mt-0.5 capitalize">{currentUser?.role}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#8C8983]" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-[#2A2A2A]">
                <div className="font-semibold text-white">{currentUser?.name}</div>
                <div className="text-[#8C8983] text-[11px]">{currentUser?.email}</div>
                <div className="text-[10px] text-[#C18B42] mt-0.5">{currentUser?.roleName}</div>
              </div>

              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#6E6B65] tracking-wider">
                Simulasi Peran / Role (RBAC)
              </div>

              {[
                { role: 'owner' as UserRole, label: 'Owner / Administrator', desc: 'Akses penuh seluruh modul & persetujuan' },
                { role: 'sales' as UserRole, label: 'Sales (Nadya Kinasih)', desc: 'CRM, Quotation, SO, tanpa akses jurnal' },
                { role: 'warehouse' as UserRole, label: 'Warehouse (Bayu Firmansyah)', desc: 'Stok, Delivery, Receipt QA, Transfer' },
                { role: 'finance' as UserRole, label: 'Finance (Fajar Pratama)', desc: 'Invoice, Vendor Bill, Jurnal, Pembayaran' },
                { role: 'cashier' as UserRole, label: 'Cashier (Salsa Widianti)', desc: 'POS Kasir Toko Bandung, struk' },
                { role: 'procurement' as UserRole, label: 'Procurement (Rizki Wardana)', desc: 'Vendor, RFQ, PO, monitor receipt' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    switchRole(item.role);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#282828] transition-colors flex items-center justify-between ${
                    currentUser?.role === item.role ? 'bg-[#2A2A2A] text-white font-medium' : 'text-[#C7C3BB]'
                  }`}
                >
                  <div>
                    <div>{item.label}</div>
                    <div className="text-[10px] text-[#8C8983]">{item.desc}</div>
                  </div>
                  {currentUser?.role === item.role && <UserCheck className="w-3.5 h-3.5 text-[#54745B]" />}
                </button>
              ))}

              <div className="border-t border-[#2A2A2A] mt-1 pt-1">
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#282828] text-[#B94B4B] flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout dari Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
