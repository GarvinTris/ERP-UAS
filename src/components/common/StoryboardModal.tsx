import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  Sparkles,
  LayoutGrid,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { AppModuleId } from '../../types/erp';

interface StoryboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScreenNav {
  id: string;
  num: number;
  name: string;
  desc: string;
  app: AppModuleId | 'logout';
  view: string;
  next?: string;
  down?: string;
  back?: string;
}

export const StoryboardModal: React.FC<StoryboardModalProps> = ({ isOpen, onClose }) => {
  const { setActiveApp, setActiveView } = useERP();
  const [activeTab, setActiveTab] = useState<'interactive_flow' | 'poster_image'>('interactive_flow');
  const [zoom, setZoom] = useState(false);

  if (!isOpen) return null;

  const screens: ScreenNav[] = [
    // Row 1: S-01 s/d S-04
    {
      id: 'S-01',
      num: 1,
      name: 'Login Page',
      desc: 'Masuk ke sistem dengan akun yang sudah terdaftar',
      app: 'logout',
      view: 'login',
      next: 'S-02',
    },
    {
      id: 'S-02',
      num: 2,
      name: 'App Switcher / Home',
      desc: 'Pilih modul yang ingin diakses',
      app: 'home',
      view: 'overview',
      next: 'S-03',
      down: 'S-06',
    },
    {
      id: 'S-03',
      num: 3,
      name: 'Dashboard (Business Overview)',
      desc: 'Melihat ringkasan bisnis & transaksi terbaru',
      app: 'dashboard',
      view: 'overview',
      next: 'S-04',
      down: 'S-07',
    },
    {
      id: 'S-04',
      num: 4,
      name: 'CRM Pipeline (Kanban)',
      desc: 'Kelola prospek dan peluang penjualan',
      app: 'crm',
      view: 'kanban',
      down: 'S-08',
    },

    // Row 2: S-05 s/d S-08
    {
      id: 'S-05',
      num: 5,
      name: 'Quotation / Sales Order Form',
      desc: 'Buat penawaran harga / Sales Order',
      app: 'sales',
      view: 'quotations',
      next: 'S-06',
      down: 'S-09',
    },
    {
      id: 'S-06',
      num: 6,
      name: 'Delivery Order Form',
      desc: 'Siapkan barang untuk pengiriman',
      app: 'inventory',
      view: 'delivery_orders',
      next: 'S-07',
      down: 'S-10',
    },
    {
      id: 'S-07',
      num: 7,
      name: 'Stock Overview & Transfers',
      desc: 'Pantau stok dan lakukan transfer',
      app: 'inventory',
      view: 'stock_overview',
      next: 'S-08',
      down: 'S-11',
    },
    {
      id: 'S-08',
      num: 8,
      name: 'Purchase Order Form',
      desc: 'Buat permintaan pembelian ke vendor',
      app: 'purchase',
      view: 'po_list',
      down: 'S-12',
    },

    // Row 3: S-09 s/d S-12
    {
      id: 'S-09',
      num: 9,
      name: 'Receipt / Quality Acceptance Form',
      desc: 'Terima barang dan lakukan quality check',
      app: 'inventory',
      view: 'receipts',
      next: 'S-10',
      down: 'S-13',
    },
    {
      id: 'S-10',
      num: 10,
      name: 'Customer Invoice Form',
      desc: 'Tagih pelanggan dan buat faktur',
      app: 'invoicing',
      view: 'invoices',
      next: 'S-11',
      down: 'S-14',
    },
    {
      id: 'S-11',
      num: 11,
      name: 'Vendor Bill Form',
      desc: 'Catat tagihan vendor',
      app: 'accounting',
      view: 'vendor_bills',
      next: 'S-12',
      down: 'S-15',
    },
    {
      id: 'S-12',
      num: 12,
      name: 'Register Payment Dialog',
      desc: 'Lakukan pembayaran ke vendor / pelanggan',
      app: 'accounting',
      view: 'register_payment',
      down: 'S-16',
    },

    // Row 4: S-13 s/d S-16
    {
      id: 'S-13',
      num: 13,
      name: 'Journal Entries / General Ledger',
      desc: 'Lihat dan kelola jurnal transaksi',
      app: 'accounting',
      view: 'journals',
      next: 'S-14',
    },
    {
      id: 'S-14',
      num: 14,
      name: 'Point of Sale Checkout',
      desc: 'Transaksi langsung di toko (kasir)',
      app: 'pos',
      view: 'pos_checkout',
      next: 'S-15',
    },
    {
      id: 'S-15',
      num: 15,
      name: 'Customer Returns & Credit Note',
      desc: 'Proses retur barang dan credit note',
      app: 'inventory',
      view: 'returns',
      next: 'S-16',
    },
    {
      id: 'S-16',
      num: 16,
      name: 'Sales & Inventory Dashboard',
      desc: 'Lihat performa penjualan & stok secara menyeluruh',
      app: 'dashboard',
      view: 'overview',
    },
  ];

  const palette = [
    { name: 'Deep Black', hex: '#171717' },
    { name: 'Soft Black', hex: '#242424' },
    { name: 'Warm Cream', hex: '#F5F0E8' },
    { name: 'Ivory White', hex: '#FFFEFC' },
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Warm Gray', hex: '#E8E4DE' },
    { name: 'Muted Gray', hex: '#8C8983' },
    { name: 'Border Gray', hex: '#E7E3DD' },
    { name: 'Success Green', hex: '#54745B' },
    { name: 'Warning Amber', hex: '#C18B42' },
    { name: 'Error Red', hex: '#B94B4B' },
  ];

  const handleNavigateScreen = (screen: ScreenNav) => {
    if (screen.app !== 'logout') {
      setActiveApp(screen.app);
      setActiveView(screen.view);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 select-none">
      <div className="bg-[#1E1E1E] border border-[#333333] rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden text-[#FFFEFC]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#2E2E2E] flex items-center justify-between bg-[#171717] flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C18B42]/10 border border-[#C18B42]/30 rounded-lg text-[#C18B42]">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#C18B42]">
                PT Rona Karsa Apparel · ERP System
              </div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                Wireframe / User Flow (S-01 s/d S-16)
              </h2>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-[#252525] rounded-xl border border-[#383838] text-xs">
              <button
                onClick={() => setActiveTab('interactive_flow')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'interactive_flow'
                    ? 'bg-[#C18B42] text-black font-semibold'
                    : 'text-[#D5CEBF] hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Alur Interaktif (16 Layar)</span>
              </button>

              <button
                onClick={() => setActiveTab('poster_image')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'poster_image'
                    ? 'bg-[#C18B42] text-black font-semibold'
                    : 'text-[#D5CEBF] hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Gambar Poster Asli</span>
              </button>
            </div>

            {activeTab === 'poster_image' && (
              <button
                onClick={() => setZoom(!zoom)}
                className="p-2 bg-[#282828] hover:bg-[#333333] text-[#D5CEBF] rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{zoom ? 'Perkecil' : 'Perbesar'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-[#8C8983] hover:text-white rounded-lg hover:bg-[#282828] transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Color Palette Strip from Storyboard */}
        <div className="px-6 py-2.5 bg-[#171717] border-b border-[#2A2A2A] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8C8983] font-medium text-[11px]">Palet Warna (untuk final design):</span>
            <div className="flex items-center gap-1.5">
              {palette.map((p) => (
                <div
                  key={p.hex}
                  className="w-5 h-5 rounded-md border border-white/20 shadow-xs cursor-pointer group relative"
                  style={{ backgroundColor: p.hex }}
                  title={`${p.name}: ${p.hex}`}
                />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-[#C18B42] font-mono">
            Gaya : Modern - Minimalist - Elegant (Terinspirasi: Odoo, dengan identitas brand sendiri)
          </span>
        </div>

        {/* Tab 1: Interactive User Flow Matrix */}
        {activeTab === 'interactive_flow' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#141414] space-y-6">
            {/* Quick Flow Narrative Banner */}
            <div className="p-4 rounded-xl bg-[#1E1E1E] border border-[#2E2E2E] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[#C18B42] font-bold uppercase tracking-wider text-[10px] block mb-1">
                  PANDUAN ALUR PENGGUNA TERINTEGRASI
                </span>
                <span className="text-[#D5CEBF]">
                  Klik pada kartu layar mana pun di bawah untuk langsung membuka modul di aplikasi live:
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono text-[#8C8983]">
                <span className="flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#C18B42]" /> Ke halaman berikutnya
                </span>
                <span className="flex items-center gap-1">
                  <ArrowDown className="w-3.5 h-3.5 text-[#54745B]" /> Ke halaman di bawahnya
                </span>
              </div>
            </div>

            {/* 4x4 Grid matching Storyboard Poster */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {screens.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleNavigateScreen(s)}
                  className="group relative p-4 rounded-xl bg-[#1C1C1C] hover:bg-[#242424] border border-[#333333] hover:border-[#C18B42] transition-all cursor-pointer shadow-md flex flex-col justify-between min-h-[160px]"
                >
                  {/* Top line: number badge and flow arrows */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#111111] text-[#C18B42] border border-[#C18B42]/40 text-[10px] font-mono font-bold flex items-center justify-center">
                        {s.num}
                      </span>
                      <span className="font-mono text-xs font-bold text-white group-hover:text-[#C18B42] transition-colors">
                        {s.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[#8C8983]">
                      {s.next && (
                        <span className="text-[10px] font-mono flex items-center gap-0.5 text-[#C18B42]/80 bg-[#171717] px-1.5 py-0.5 rounded border border-[#333333]">
                          <ArrowRight className="w-2.5 h-2.5" /> {s.next}
                        </span>
                      )}
                      {s.down && (
                        <span className="text-[10px] font-mono flex items-center gap-0.5 text-[#54745B]/80 bg-[#171717] px-1.5 py-0.5 rounded border border-[#333333]">
                          <ArrowDown className="w-2.5 h-2.5" /> {s.down}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="my-auto">
                    <h3 className="font-bold text-sm text-[#FFFEFC] group-hover:text-[#C18B42] transition-colors leading-snug">
                      {s.name}
                    </h3>
                    <p className="text-xs text-[#8C8983] group-hover:text-[#D5CEBF] transition-colors mt-1.5 leading-relaxed italic">
                      "{s.desc}"
                    </p>
                  </div>

                  {/* Bottom launch button indicator */}
                  <div className="pt-3 border-t border-[#292929] flex items-center justify-between text-[11px] text-[#A6A29A]">
                    <span className="capitalize font-mono text-[10px] text-[#8C8983]">{s.app}</span>
                    <span className="text-[#C18B42] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Buka Layar <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Storyboard Poster Footer Note */}
            <div className="p-4 bg-[#171717] rounded-xl border border-[#2E2E2E] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-[#8C8983]">
              <div className="space-y-1">
                <div className="font-semibold text-white">Keterangan Alur:</div>
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                  <span>➔ Ke halaman berikutnya</span>
                  <span>▼ Ke halaman di bawahnya</span>
                  <span>◀ Kembali ke halaman sebelumnya</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-white tracking-wider">RONA KARSA APPAREL</div>
                <div className="text-[10px] text-[#C18B42]">Elegance in Every Detail.</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Poster Image View */}
        {activeTab === 'poster_image' && (
          <div className="flex-1 overflow-auto p-4 md:p-6 bg-[#141414] flex justify-center items-start">
            <div className={`transition-all duration-300 ${zoom ? 'max-w-none w-[200%]' : 'max-w-5xl w-full'}`}>
              <img
                src="/public/assets/aistudio/Hand-Drawn_ERP_System_Wireframe_Storyboard_9a405b51.png"
                alt="Hand-Drawn ERP System Wireframe Storyboard (S-01 s/d S-16)"
                className="w-full h-auto rounded-xl border border-[#333333] shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#171717] border-t border-[#2E2E2E] flex items-center justify-between text-xs text-[#8C8983]">
          <div>
            Referensi:{' '}
            <span className="font-mono text-[#E8E4DE]">
              Wireframe / User Flow (S-01 s/d S-16) · Odoo Web 17.0 Benchmark
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#C18B42] text-black font-semibold rounded-lg hover:bg-[#d69f53] transition-colors"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
