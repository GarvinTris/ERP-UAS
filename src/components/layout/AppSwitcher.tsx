import React from 'react';
import {
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
  Lock,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { AppModuleId } from '../../types/erp';

interface AppItem {
  id: AppModuleId;
  name: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  category: string;
}

export const AppSwitcher: React.FC = () => {
  const {
    currentUser,
    setActiveApp,
    setAppSwitcherOpen,
    checkRoleAccess,
    logAudit,
    addNotification,
    stock,
    salesOrders,
    leads,
  } = useERP();

  const totalReserved = stock.reduce((sum, s) => sum + s.reserved, 0);

  const apps: AppItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'KPI Penjualan, PPN, HPP, Persediaan, dan AR/AP',
      icon: LayoutDashboard,
      category: 'Overview',
    },
    {
      id: 'crm',
      name: 'CRM Pipeline',
      description: 'Manajemen lead B2B/ritel, pipeline konversi, & aktivitas',
      icon: Users,
      badge: `${leads.length} Leads`,
      category: 'Sales',
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Quotation, Sales Order, validasi kredit & diskon, reservasi',
      icon: BadgeDollarSign,
      badge: `${salesOrders.length} Orders`,
      category: 'Sales',
    },
    {
      id: 'pos',
      name: 'Point of Sale',
      description: 'Kasir retail toko Bandung (STORE-BDG), struk, & sinkronisasi',
      icon: ShoppingCart,
      category: 'Retail',
    },
    {
      id: 'inventory',
      name: 'Inventory',
      description: 'Stok multi-lokasi (WH-JKT, STORE-BDG), delivery, QA & transfer',
      icon: Layers,
      badge: `${totalReserved} Ter-reservasi`,
      category: 'Supply Chain',
    },
    {
      id: 'purchase',
      name: 'Purchase',
      description: 'RFQ, Purchase Order, vendor pricelist, Three-Way Matching',
      icon: Package,
      category: 'Supply Chain',
    },
    {
      id: 'invoicing',
      name: 'Invoicing',
      description: 'Faktur penjualan berbasis pengiriman & Credit Note',
      icon: Receipt,
      category: 'Finance',
    },
    {
      id: 'accounting',
      name: 'Accounting',
      description: 'Buku besar, jurnal umum seimbang, utang-piutang & pembayaran',
      icon: BookOpen,
      category: 'Finance',
    },
    {
      id: 'contacts',
      name: 'Contacts',
      description: 'Master pelanggan & vendor, credit limit, payment terms',
      icon: Contact,
      category: 'Master Data',
    },
    {
      id: 'products',
      name: 'Products',
      description: '15 SKU varian fashion (ukuran & warna unik), harga & biaya',
      icon: Shirt,
      badge: '15 Varian',
      category: 'Master Data',
    },
    {
      id: 'reporting',
      name: 'Reporting',
      description: 'Analisis penjualan, perputaran stok, dan status fiskal PPN',
      icon: BarChart3,
      category: 'Management',
    },
    {
      id: 'audit',
      name: 'Audit Log',
      description: 'Jejak audit aktivitas dokumen, otorisasi, dan idempotensi',
      icon: ShieldCheck,
      category: 'Governance',
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'Konfigurasi perusahaan, hak akses RBAC, sequence dokumen',
      icon: Settings,
      category: 'Governance',
    },
  ];

  const handleAppClick = (appId: AppModuleId) => {
    const isAllowed = checkRoleAccess(appId);
    if (!isAllowed) {
      logAudit(
        'ACCESS_APP',
        appId.toUpperCase(),
        'NAVIGATION',
        `Akses modul ${appId} ditolak untuk role ${currentUser?.role} (SR-16).`,
        'DENIED'
      );
      addNotification(
        'error',
        `Akses Ditolak: Role "${currentUser?.roleName}" tidak memiliki izin untuk modul ${appId} (SR-16)!`
      );
      return;
    }

    setActiveApp(appId);
    setAppSwitcherOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-[#171717]/95 backdrop-blur-md z-40 flex flex-col p-6 md:p-12 overflow-y-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-[#C18B42] font-semibold mb-1">
            PT Rona Karsa Apparel · Odoo Web 17.0 Experience
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Beranda App Switcher (S-01)</h1>
          <p className="text-xs text-[#8C8983] mt-0.5">
            Pilih aplikasi kerja. Hak akses dibatasi menurut peran aktif: <span className="text-[#FFFEFC] font-semibold">{currentUser?.name} ({currentUser?.roleName})</span>
          </p>
        </div>

        <button
          onClick={() => setAppSwitcherOpen(false)}
          className="px-4 py-2 text-xs rounded-lg border border-[#333333] hover:bg-[#282828] text-white transition-colors"
        >
          Kembali ke Modul
        </button>
      </div>

      {/* Grid of Applications */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto w-full">
        {apps.map((app) => {
          const Icon = app.icon;
          const isAllowed = checkRoleAccess(app.id);

          return (
            <button
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className={`group relative text-left p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between h-40 ${
                isAllowed
                  ? 'bg-[#1E1E1E] hover:bg-[#252525] border-[#333333] hover:border-[#C18B42]/50 hover:shadow-lg'
                  : 'bg-[#1A1A1A]/70 border-[#2A2A2A] opacity-60 hover:opacity-80'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${
                    isAllowed ? 'bg-[#282828] group-hover:bg-[#C18B42] group-hover:text-black text-white' : 'bg-[#222222] text-[#6E6B65]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {!isAllowed ? (
                  <span className="flex items-center gap-1 text-[10px] text-[#B94B4B] bg-[#B94B4B]/10 px-2 py-0.5 rounded border border-[#B94B4B]/20">
                    <Lock className="w-2.5 h-2.5" /> Terbatas
                  </span>
                ) : app.badge ? (
                  <span className="text-[10px] font-mono text-[#C18B42] bg-[#C18B42]/10 px-2 py-0.5 rounded border border-[#C18B42]/20">
                    {app.badge}
                  </span>
                ) : null}
              </div>

              <div>
                <div className="font-semibold text-sm text-white group-hover:text-[#F5F0E8] flex items-center gap-1">
                  {app.name}
                </div>
                <div className="text-[11px] text-[#8C8983] line-clamp-2 mt-1 leading-snug">
                  {app.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Role explanation footer */}
      <div className="max-w-6xl mx-auto w-full mt-10 p-4 rounded-xl bg-[#1E1E1E] border border-[#2E2E2E] text-xs text-[#8C8983] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-white font-medium">SR-16 Role Access Matrix: </span>
          <span>Sales (Sales, CRM, Contacts), Warehouse (Inventory, Products), Finance (Invoicing, Accounting), Cashier (POS), Procurement (Purchase), Owner (Semua).</span>
        </div>
        <div className="text-[11px] text-[#C18B42] font-mono">
          Ref: Odoo 17.0 App Grid UX
        </div>
      </div>
    </div>
  );
};
