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
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { AppModuleId } from '../../types/erp';

export const HomeModule: React.FC<{ onOpenStoryboard?: () => void }> = ({ onOpenStoryboard }) => {
  const { currentUser, setActiveApp, setActiveView, checkRoleAccess, logAudit, addNotification } = useERP();

  const appCards = [
    {
      id: 'dashboard' as AppModuleId,
      title: 'Dashboard',
      subtitle: 'Overview & KPI',
      icon: LayoutDashboard,
      desc: 'Ringkasan penjualan, PPN 11%, nilai persediaan, AR/AP, dan tren performa.',
    },
    {
      id: 'crm' as AppModuleId,
      title: 'CRM',
      subtitle: 'Leads & Opportunity',
      icon: Users,
      desc: 'Pipeline penjualan bergaya Kanban dari kontak awal hingga siap penawaran.',
    },
    {
      id: 'sales' as AppModuleId,
      title: 'Sales',
      subtitle: 'Quotation & Orders',
      icon: BadgeDollarSign,
      desc: 'Penawaran harga, validasi kredit (SR-10), approval diskon, & konfirmasi pesanan.',
    },
    {
      id: 'pos' as AppModuleId,
      title: 'Point of Sale',
      subtitle: 'Retail Store',
      icon: ShoppingCart,
      desc: 'Kasir toko retail Bandung (STORE-BDG), katalog produk, & cetak struk thermal.',
    },
    {
      id: 'purchase' as AppModuleId,
      title: 'Purchase',
      subtitle: 'RFQ & PO',
      icon: Package,
      desc: 'Permintaan penawaran, Purchase Order ke vendor, & Three-Way Matching (SR-06).',
    },
    {
      id: 'inventory' as AppModuleId,
      title: 'Inventory',
      subtitle: 'Stock & Logistics',
      icon: Layers,
      desc: 'Posisi stok fisik multi-lokasi (WH-JKT & STORE-BDG), Delivery Order, QA, & transfer.',
    },
    {
      id: 'invoicing' as AppModuleId,
      title: 'Invoicing',
      subtitle: 'Customer & Vendor',
      icon: Receipt,
      desc: 'Faktur penjualan berbasis unit terkirim (SR-02) & pencatatan piutang.',
    },
    {
      id: 'accounting' as AppModuleId,
      title: 'Accounting',
      subtitle: 'Journal & Ledger',
      icon: BookOpen,
      desc: 'Buku besar, jurnal umum berpasangan seimbang (Debit == Kredit), & pembayaran.',
    },
    {
      id: 'contacts' as AppModuleId,
      title: 'Contacts',
      subtitle: 'Customer & Vendor',
      icon: Contact,
      desc: 'Master data pelanggan B2B/ritel, batas kredit, termin, & pemasok.',
    },
    {
      id: 'products' as AppModuleId,
      title: 'Products',
      subtitle: 'Product & Variants',
      icon: Shirt,
      desc: 'Katalog 15 SKU varian fashion dengan atribut ukuran & warna unik (SR-11).',
    },
    {
      id: 'reporting' as AppModuleId,
      title: 'Reporting',
      subtitle: 'Reports & Analytics',
      icon: BarChart3,
      desc: 'Laporan keuangan, evaluasi perpajakan PPN, perputaran stok, dan penjualan.',
    },
    {
      id: 'settings' as AppModuleId,
      title: 'Settings',
      subtitle: 'Configuration',
      icon: Settings,
      desc: 'Konfigurasi profil perusahaan, matriks hak akses RBAC, & sequence dokumen.',
    },
    {
      id: 'audit' as AppModuleId,
      title: 'Audit Log',
      subtitle: 'Trail & Security',
      icon: ShieldCheck,
      desc: 'Perekaman seluruh aktivitas sistem, aktor, waktu, dokumen, & pencegahan posting ganda.',
    },
  ];

  const handleLaunch = (appId: AppModuleId) => {
    const isAllowed = checkRoleAccess(appId);
    if (!isAllowed) {
      logAudit('ACCESS_APP', appId.toUpperCase(), 'HOME', `Akses modul ${appId} ditolak untuk role ${currentUser?.role} (SR-16).`, 'DENIED');
      addNotification('error', `Akses Ditolak: Role "${currentUser?.roleName}" tidak memiliki hak akses modul ${appId}!`);
      return;
    }
    setActiveApp(appId);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      {/* Top Welcome Banner matching S-02 Sketch */}
      <div className="bg-[#FFFEFC] border-b border-[#E7E3DD] px-8 py-8 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#C18B42] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>S-02. App Switcher / Home</span>
            </div>
            <h1 className="text-3xl font-bold text-[#171717] tracking-tight">
              Welcome back, {currentUser?.name || 'Admin'}
            </h1>
            <p className="text-sm text-[#8C8983] mt-1">
              PT Rona Karsa Apparel · Enterprise Workspace ({currentUser?.roleName})
            </p>
          </div>

          {onOpenStoryboard && (
            <button
              onClick={onOpenStoryboard}
              className="px-4 py-2.5 bg-[#171717] hover:bg-[#282828] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <Eye className="w-4 h-4 text-[#C18B42]" />
              <span>Lihat Sketsa Wireframe Storyboard (S-01 s/d S-16)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid matching S-02 Wireframe Sketch */}
      <div className="p-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#171717]">Business Applications</h2>
            <p className="text-xs text-[#8C8983]">Pilih modul yang berwenang untuk mulai bekerja</p>
          </div>
          <span className="text-xs font-mono text-[#8C8983] bg-white px-2.5 py-1 rounded-md border border-[#E7E3DD]">
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
                className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-44 group ${
                  isAllowed
                    ? 'bg-[#FFFEFC] hover:bg-white border-[#E7E3DD] hover:border-[#171717] shadow-2xs hover:shadow-md'
                    : 'bg-[#EAE5DC]/60 border-[#D5CEBF] opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      isAllowed
                        ? 'bg-[#F5F0E8] group-hover:bg-[#171717] group-hover:text-white text-[#171717]'
                        : 'bg-[#D5CEBF] text-[#8C8983]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {!isAllowed ? (
                    <span className="flex items-center gap-1 text-[10px] text-[#B94B4B] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                      <Lock className="w-2.5 h-2.5" /> Terbatas
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-semibold text-[#8C8983] group-hover:text-[#C18B42] flex items-center gap-0.5">
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
