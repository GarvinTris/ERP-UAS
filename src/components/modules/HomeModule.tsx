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
  ArrowRight,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { AppModuleId } from '../../types/erp';

export const HomeModule: React.FC = () => {
  const { currentUser, setActiveApp, checkRoleAccess, logAudit, addNotification, products } = useERP();

  const appCards = [
    {
      id: 'dashboard' as AppModuleId,
      title: 'Dashboard',
      subtitle: 'Overview & KPI',
      icon: LayoutDashboard,
      accent: 'text-[#1D4ED8] bg-[#1D4ED8]/10',
      desc: 'Ringkasan penjualan, PPN 11%, nilai persediaan, AR/AP, dan tren performa.',
    },
    {
      id: 'crm' as AppModuleId,
      title: 'CRM',
      subtitle: 'Leads & Opportunity',
      icon: Users,
      accent: 'text-[#B45309] bg-[#B45309]/10',
      desc: 'Pipeline penjualan bergaya Kanban dari kontak awal hingga siap penawaran.',
    },
    {
      id: 'sales' as AppModuleId,
      title: 'Sales',
      subtitle: 'Quotation & Orders',
      icon: BadgeDollarSign,
      accent: 'text-[#15803D] bg-[#15803D]/10',
      desc: 'Penawaran harga, validasi kredit, approval diskon, & konfirmasi pesanan.',
    },
    {
      id: 'pos' as AppModuleId,
      title: 'Point of Sale',
      subtitle: 'Retail Store',
      icon: ShoppingCart,
      accent: 'text-[#7C3AED] bg-[#7C3AED]/10',
      desc: 'Kasir toko retail Bandung (STORE-BDG), katalog produk, & cetak struk thermal.',
    },
    {
      id: 'purchase' as AppModuleId,
      title: 'Purchase',
      subtitle: 'RFQ & PO',
      icon: Package,
      accent: 'text-[#0F766E] bg-[#0F766E]/10',
      desc: 'Permintaan penawaran, Purchase Order ke vendor, & Three-Way Matching.',
    },
    {
      id: 'inventory' as AppModuleId,
      title: 'Inventory',
      subtitle: 'Stock & Logistics',
      icon: Layers,
      accent: 'text-[#C2410C] bg-[#C2410C]/10',
      desc: 'Posisi stok fisik multi-lokasi (WH-JKT & STORE-BDG), Delivery Order, QA, & transfer.',
    },
    {
      id: 'invoicing' as AppModuleId,
      title: 'Invoicing',
      subtitle: 'Customer & Vendor',
      icon: Receipt,
      accent: 'text-[#0369A1] bg-[#0369A1]/10',
      desc: 'Faktur penjualan berbasis unit terkirim & pencatatan piutang.',
    },
    {
      id: 'accounting' as AppModuleId,
      title: 'Accounting',
      subtitle: 'Journal & Ledger',
      icon: BookOpen,
      accent: 'text-[#4338CA] bg-[#4338CA]/10',
      desc: 'Buku besar, jurnal umum berpasangan seimbang (Debit == Kredit), & pembayaran.',
    },
    {
      id: 'contacts' as AppModuleId,
      title: 'Contacts',
      subtitle: 'Customer & Vendor',
      icon: Contact,
      accent: 'text-[#B45309] bg-[#B45309]/10',
      desc: 'Master data pelanggan B2B/ritel, batas kredit, termin, & pemasok.',
    },
    {
      id: 'products' as AppModuleId,
      title: 'Products',
      subtitle: 'Product & Variants',
      icon: Shirt,
      accent: 'text-[#BE185D] bg-[#BE185D]/10',
      desc: `Katalog ${products.length} SKU varian fashion dengan atribut ukuran, warna, & harga.`,
    },
    {
      id: 'reporting' as AppModuleId,
      title: 'Reporting',
      subtitle: 'Reports & Analytics',
      icon: BarChart3,
      accent: 'text-[#15803D] bg-[#15803D]/10',
      desc: 'Laporan keuangan, evaluasi perpajakan PPN, perputaran stok, dan penjualan.',
    },
    {
      id: 'settings' as AppModuleId,
      title: 'Settings',
      subtitle: 'Configuration',
      icon: Settings,
      accent: 'text-[#525252] bg-[#525252]/10',
      desc: 'Konfigurasi profil perusahaan, matriks hak akses RBAC, & sequence dokumen.',
    },
    {
      id: 'audit' as AppModuleId,
      title: 'Audit Log',
      subtitle: 'Trail & Security',
      icon: ShieldCheck,
      accent: 'text-[#374151] bg-[#374151]/10',
      desc: 'Perekaman seluruh aktivitas sistem, aktor, waktu, dokumen, & pencegahan posting ganda.',
    },
  ];

  const handleLaunch = (appId: AppModuleId) => {
    const isAllowed = checkRoleAccess(appId);
    if (!isAllowed) {
      logAudit('ACCESS_APP', appId.toUpperCase(), 'HOME', `Akses modul ${appId} ditolak untuk role ${currentUser?.role}.`, 'DENIED');
      addNotification('error', `Akses Ditolak: Role "${currentUser?.roleName}" tidak memiliki hak akses modul ${appId}!`);
      return;
    }
    setActiveApp(appId);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      {/* Top Welcome Banner */}
      <div className="bg-[#FFFEFC] border-b border-[#E7E3DD] px-8 py-7">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#C18B42] mb-1">
              Workspace Home
            </div>
            <h1 className="text-3xl font-bold text-[#171717] tracking-tight">
              Selamat datang, {currentUser?.name || 'Admin'}
            </h1>
            <p className="text-sm text-[#8C8983] mt-1">
              PT Rona Karsa Apparel · {currentUser?.roleName}
            </p>
          </div>
        </div>
      </div>

      {/* Main Odoo App Grid */}
      <div className="p-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#171717]">Aplikasi Bisnis</h2>
            <p className="text-xs text-[#8C8983]">Pilih modul untuk mulai bekerja</p>
          </div>
          <span className="text-xs font-mono text-[#8C8983]">
            13 Modul Terintegrasi
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {appCards.map((app) => {
            const Icon = app.icon;
            const isAllowed = checkRoleAccess(app.id);

            return (
              <button
                key={app.id}
                type="button"
                onClick={() => handleLaunch(app.id)}
                className={`p-5 rounded-xl border text-left transition-colors flex flex-col justify-between h-44 group ${
                  isAllowed
                    ? 'bg-[#FFFEFC] hover:bg-white border-[#E7E3DD] hover:border-[#171717]'
                    : 'bg-[#EAE5DC]/60 border-[#D5CEBF] opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      isAllowed
                        ? `${app.accent} group-hover:bg-[#171717] group-hover:text-white`
                        : 'bg-[#D5CEBF] text-[#8C8983]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {!isAllowed ? (
                    <span className="flex items-center gap-1 text-[11px] text-[#B94B4B] font-medium">
                      <Lock className="w-3 h-3" /> Terbatas
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-[#8C8983] group-hover:text-[#C18B42] flex items-center gap-0.5">
                      Buka <ArrowRight className="w-3 h-3 inline transition-transform group-hover:translate-x-0.5" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#171717] group-hover:text-[#C18B42] transition-colors leading-tight">
                    {app.title}
                  </h3>
                  <div className="text-[11px] font-mono text-[#8C8983] mt-0.5">{app.subtitle}</div>
                  <div className="text-[11px] text-[#8C8983] mt-1.5 line-clamp-2 leading-relaxed">
                    {app.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
