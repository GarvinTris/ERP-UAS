import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import {
  TrendingUp,
  Receipt,
  Layers,
  ShoppingBag,
  CreditCard,
  Building2,
  ExternalLink,
  ShieldAlert,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { SalesTrendChart, SalesByProductChart } from '../common/AnalyticsCharts';

export const DashboardModule: React.FC = () => {
  const {
    currentUser,
    customerInvoices,
    posTransactions,
    stock,
    products,
    vendorBills,
    salesOrders,
    logAudit,
    setActiveApp,
    setActiveView,
  } = useERP();

  const isCashier = currentUser?.role === 'cashier';
  const isSalesOnly = currentUser?.role === 'sales';

  const [channelFilter, setChannelFilter] = useState<'all' | 'pos' | 'invoices'>('all');
  const [drillDownType, setDrillDownType] = useState<string | null>(null);

  // Calculations based on filter
  const postedInvoices = customerInvoices.filter((i) => i.status !== 'draft' && i.status !== 'cancelled');

  let netSales = 0;
  let ppnSales = 0;
  let unitsSold = 0;

  if (channelFilter === 'all' || channelFilter === 'pos') {
    posTransactions.forEach((pos) => {
      netSales += pos.untaxed_amount;
      ppnSales += pos.tax_amount;
      unitsSold += pos.lines.reduce((s, l) => s + l.quantity, 0);
    });
  }

  if ((channelFilter === 'all' || channelFilter === 'invoices') && !isCashier) {
    postedInvoices.forEach((inv) => {
      netSales += inv.untaxed_amount;
      ppnSales += inv.tax_amount;
      unitsSold += inv.lines.reduce((s, l) => s + l.quantity, 0);
    });
  }

  const grossSales = netSales + ppnSales;

  // Inventory valuation
  const inventoryValue = stock.reduce((sum, s) => {
    const prod = products.find((p) => p.sku === s.sku);
    return sum + s.on_hand * (prod?.cost_idr || 0);
  }, 0);

  // AR & AP (Cashier cannot see company AR/AP according to SR-16)
  const totalAR = postedInvoices.reduce((sum, i) => sum + i.residual, 0);
  const totalAP = vendorBills
    .filter((b) => b.status !== 'draft')
    .reduce((sum, b) => sum + b.residual, 0);

  const handleCashierRestrictedClick = (metricName: string) => {
    logAudit(
      'RESTRICTED_ACCESS_ATTEMPT',
      'DASHBOARD',
      metricName,
      `Akun Cashier berusaha melihat ${metricName} perusahaan melalui dashboard. Akses dibatasi (SR-16).`,
      'DENIED'
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-03 / S-16"
        flowHint="S-03 Ringkasan bisnis ➔ S-16 Sales & Inventory Dashboard (Drill-down SR-14)"
        title="Business Overview · Sales & Inventory Dashboard"
        subtitle="Business Overview, Indikator Finansial, Kontrol Hak Akses (SR-16) & Penelusuran Dokumen (SR-14)"
        extraActions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChannelFilter('pos')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                channelFilter === 'pos'
                  ? 'bg-[#171717] text-white'
                  : 'bg-white border border-[#E7E3DD] text-[#8C8983] hover:text-[#171717]'
              }`}
            >
              Filter Transaksi POS Saja (Uji T-32)
            </button>
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                channelFilter === 'all'
                  ? 'bg-[#171717] text-white'
                  : 'bg-white border border-[#E7E3DD] text-[#8C8983] hover:text-[#171717]'
              }`}
            >
              Semua Kanal
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Role Notice for Cashier (T-33) */}
        {isCashier && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C18B42]" />
              <span>
                <strong>Mode Tampilan Kasir (Role Cashier):</strong> Berdasarkan aturan <strong>SR-16</strong>, metrik buku besar jurnal dan piutang global perusahaan disembunyikan.
              </span>
            </div>
            <span className="font-mono text-[10px] bg-amber-200 px-2 py-0.5 rounded">T-33 FILTER AKTIF</span>
          </div>
        )}

        {/* 6 Primary KPI Cards matching S-16 Wireframe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Net Sales */}
          <div
            onClick={() => setDrillDownType('net_sales')}
            className="p-5 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] hover:border-[#171717] transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between text-xs text-[#8C8983] mb-1">
              <span className="font-medium">Net Sales (Sebelum PPN)</span>
              <TrendingUp className="w-4 h-4 text-[#54745B]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#171717] group-hover:text-[#C18B42] transition-colors">
              Rp{netSales.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8C8983] mt-2 flex items-center justify-between">
              <span>Klik untuk drill-down dokumen</span>
              <span className="text-[#C18B42] font-semibold">T-32: Rp240.000</span>
            </div>
          </div>

          {/* 2. PPN */}
          <div
            onClick={() => setDrillDownType('ppn')}
            className="p-5 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] hover:border-[#171717] transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between text-xs text-[#8C8983] mb-1">
              <span className="font-medium">PPN Efektif 11%</span>
              <Receipt className="w-4 h-4 text-[#C18B42]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#171717] group-hover:text-[#C18B42] transition-colors">
              Rp{ppnSales.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8C8983] mt-2 flex items-center justify-between">
              <span>Tarif formal 12% × DPP 11/12</span>
              <span className="text-[#C18B42] font-semibold">T-32: Rp26.400</span>
            </div>
          </div>

          {/* 3. Gross Sales */}
          <div
            onClick={() => setDrillDownType('gross_sales')}
            className="p-5 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] hover:border-[#171717] transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between text-xs text-[#8C8983] mb-1">
              <span className="font-medium">Gross Sales (Total Bruto)</span>
              <ShoppingBag className="w-4 h-4 text-[#171717]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#171717] group-hover:text-[#C18B42] transition-colors">
              Rp{grossSales.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8C8983] mt-2 flex items-center justify-between">
              <span>Net Sales + PPN</span>
              <span className="text-[#C18B42] font-semibold">T-32: Rp266.400</span>
            </div>
          </div>

          {/* 4. Inventory Value */}
          <div
            onClick={() => setDrillDownType('inventory')}
            className="p-5 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] hover:border-[#171717] transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between text-xs text-[#8C8983] mb-1">
              <span className="font-medium">Nilai Persediaan (Inventory)</span>
              <Layers className="w-4 h-4 text-[#171717]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#171717] group-hover:text-[#C18B42] transition-colors">
              Rp{inventoryValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8C8983] mt-2 flex items-center justify-between">
              <span>WH-JKT & STORE-BDG</span>
              <span className="font-semibold text-[#54745B]">106 unit baseline</span>
            </div>
          </div>

          {/* 5. AR / AP */}
          <div
            onClick={() => {
              if (isCashier) {
                handleCashierRestrictedClick('Accounts Receivable / Payable');
              } else {
                setDrillDownType('arap');
              }
            }}
            className={`p-5 rounded-xl border transition-all shadow-2xs group ${
              isCashier
                ? 'bg-[#F5F0E8] border-[#E7E3DD] opacity-70 cursor-not-allowed'
                : 'bg-[#FFFEFC] border-[#E7E3DD] hover:border-[#171717] cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-[#8C8983] mb-1">
              <span className="font-medium">Piutang (AR) / Utang (AP)</span>
              <CreditCard className="w-4 h-4 text-[#C18B42]" />
            </div>
            {isCashier ? (
              <div className="text-sm font-semibold text-[#8C8983] mt-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#B94B4B]" />
                <span>Dibatasi untuk Kasir (SR-16)</span>
              </div>
            ) : (
              <div className="text-xl font-bold font-mono text-[#171717] group-hover:text-[#C18B42]">
                AR: Rp{totalAR.toLocaleString()} · AP: Rp{totalAP.toLocaleString()}
              </div>
            )}
            <div className="text-[11px] text-[#8C8983] mt-2">
              {isCashier ? 'Hak akses minimal diterapkan' : 'Klik untuk rincian tagihan terbuka'}
            </div>
          </div>

          {/* 6. Units Sold */}
          <div
            onClick={() => setDrillDownType('units')}
            className="p-5 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] hover:border-[#171717] transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between text-xs text-[#8C8983] mb-1">
              <span className="font-medium">Unit Terjual (Units Sold)</span>
              <Building2 className="w-4 h-4 text-[#54745B]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#171717] group-hover:text-[#C18B42] transition-colors">
              {unitsSold} pcs
            </div>
            <div className="text-[11px] text-[#8C8983] mt-2 flex items-center justify-between">
              <span>Total kuantitas barang fisik</span>
              <span className="text-[#C18B42] font-semibold">T-32: 2 pcs</span>
            </div>
          </div>
        </div>

        {/* Charts Section matching Storyboard S-03 & S-16 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SalesTrendChart title="Sales Trend" subtitle="Volume & nilai penjualan harian (Oct 5..30)" />
          <SalesByProductChart title="Sales by Product (Porsi Busana)" />
        </div>

        {/* Recent Transactions Table matching S-03 Storyboard Sketch */}
        <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#E7E3DD] flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase text-[#171717] tracking-wider">
                Recent Transactions (S-03)
              </h4>
              <p className="text-[11px] text-[#8C8983]">
                Daftar transaksi penjualan & faktur terintegrasi terkini
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#8C8983]">Data Terkini</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5F0E8] text-[#8C8983] font-mono text-[11px] uppercase border-b border-[#E7E3DD]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Document</th>
                  <th className="py-2.5 px-4 font-semibold">Customer / Location</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DD] font-mono">
                <tr className="hover:bg-[#F5F0E8]/50 transition-colors cursor-pointer" onClick={() => { setActiveApp('sales'); setActiveView('quotations'); }}>
                  <td className="py-3 px-4 font-bold text-[#C18B42]">S00007</td>
                  <td className="py-3 px-4 font-sans text-[#171717]">PT Sinar Kampus</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-[#54745B]/10 text-[#54745B] border border-[#54745B]/30">
                      Confirmed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#171717]">Rp499.600</td>
                </tr>

                <tr className="hover:bg-[#F5F0E8]/50 transition-colors cursor-pointer" onClick={() => { setActiveApp('invoicing'); setActiveView('invoices'); }}>
                  <td className="py-3 px-4 font-bold text-[#171717]">INV0007</td>
                  <td className="py-3 px-4 font-sans text-[#171717]">PT Sinar Kampus</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Posted
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#171717]">Rp333.000</td>
                </tr>

                <tr className="hover:bg-[#F5F0E8]/50 transition-colors cursor-pointer" onClick={() => { setActiveApp('pos'); setActiveView('pos_history'); }}>
                  <td className="py-3 px-4 font-bold text-[#54745B]">POS-BDG-001</td>
                  <td className="py-3 px-4 font-sans text-[#171717]">Toko Retail Bandung (Store BDG)</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-emerald-50 text-[#54745B] border border-emerald-200">
                      Paid
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#171717]">Rp266.400</td>
                </tr>

                {postedInvoices.filter(i => i.invoice_id !== 'INV0007').slice(0, 2).map((inv) => (
                  <tr key={inv.invoice_id} className="hover:bg-[#F5F0E8]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#171717]">{inv.invoice_id}</td>
                    <td className="py-3 px-4 font-sans text-[#171717]">{inv.customer_id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#171717]">
                      Rp{inv.total_amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Queues Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] shadow-2xs">
            <h4 className="font-bold text-xs uppercase text-[#171717] tracking-wider mb-3">
              Pesanan Terbuka (Sales Orders)
            </h4>
            <div className="space-y-2 text-xs">
              {salesOrders.slice(0, 3).map((so) => (
                <div key={so.order_id} className="p-2.5 rounded-lg bg-[#F5F0E8] flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-[#C18B42]">{so.order_id}</span>
                    <span className="text-[#8C8983] ml-2">{so.customer_id}</span>
                  </div>
                  <span className="font-mono font-semibold">Rp{so.total_amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] shadow-2xs">
            <h4 className="font-bold text-xs uppercase text-[#171717] tracking-wider mb-3">
              Transaksi POS Terakhir
            </h4>
            <div className="space-y-2 text-xs">
              {posTransactions.length === 0 ? (
                <div className="text-[#8C8983] text-center py-4">Belum ada transaksi POS</div>
              ) : (
                posTransactions.slice(0, 3).map((pos) => (
                  <div key={pos.pos_id} className="p-2.5 rounded-lg bg-[#F5F0E8] flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[#171717]">{pos.pos_id}</span>
                      <span className="text-[#8C8983] ml-2">{pos.lines[0]?.sku}</span>
                    </div>
                    <span className="font-mono font-bold text-[#54745B]">Rp{pos.total_amount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] shadow-2xs">
            <h4 className="font-bold text-xs uppercase text-[#171717] tracking-wider mb-3">
              Pemberitahuan Stok Terendah
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between text-red-900">
                <span>AP-TS-BLK-L (WH-JKT)</span>
                <span className="font-bold">0 unit</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900">
                <span>AP-DR-BLU-S (STORE-BDG)</span>
                <span className="font-bold">0 unit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drill-down Modal (SR-14) */}
      {drillDownType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFEFC] rounded-2xl max-w-3xl w-full border border-[#E7E3DD] shadow-2xl p-6 text-[#171717]">
            <div className="flex items-center justify-between border-b border-[#E7E3DD] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C18B42]" />
                <h3 className="font-bold text-base">Drill-Down Penelusuran Dokumen Sumber (SR-14)</h3>
              </div>
              <button onClick={() => setDrillDownType(null)} className="text-[#8C8983] hover:text-[#171717]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto">
              <div className="p-3 bg-[#F5F0E8] rounded-lg text-[#8C8983]">
                Berikut adalah dokumen sumber yang membentuk metrik yang Anda pilih. Setiap angka di dashboard dapat ditelusuri ke transaksi riil.
              </div>

              {/* Transactions breakdown */}
              {posTransactions.map((pos) => (
                <div key={pos.pos_id} className="p-3.5 rounded-lg border border-[#E7E3DD] flex items-center justify-between bg-white font-mono">
                  <div>
                    <span className="font-bold text-[#C18B42]">{pos.pos_id}</span>
                    <span className="text-[#8C8983] ml-2">Point of Sale Toko Bandung</span>
                    <div className="text-[11px] text-[#171717] mt-0.5">{pos.lines[0]?.product_name} ({pos.lines[0]?.quantity} pcs)</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">Rp{pos.total_amount.toLocaleString()}</div>
                    <div className="text-[10px] text-[#8C8983]">PPN: Rp{pos.tax_amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}

              {postedInvoices.map((inv) => (
                <div key={inv.invoice_id} className="p-3.5 rounded-lg border border-[#E7E3DD] flex items-center justify-between bg-white font-mono">
                  <div>
                    <span className="font-bold text-[#54745B]">{inv.invoice_id}</span>
                    <span className="text-[#8C8983] ml-2">Customer Invoice ({inv.customer_id})</span>
                    <div className="text-[11px] text-[#171717] mt-0.5">{inv.lines[0]?.product_name} ({inv.lines[0]?.quantity} pcs)</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">Rp{inv.total_amount.toLocaleString()}</div>
                    <div className="text-[10px] text-[#8C8983]">PPN: Rp{inv.tax_amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E7E3DD] flex justify-end">
              <button
                onClick={() => setDrillDownType(null)}
                className="px-4 py-2 bg-[#171717] text-white rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
