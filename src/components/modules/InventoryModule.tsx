import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { Layers, ArrowRightLeft, History, Building2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const {
    stock,
    products,
    stockMoves,
    transfers,
    executeInternalTransfer,
    activeView,
    setActiveView,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'overview' | 'transfers' | 'moves'>('overview');
  const [filterLocation, setFilterLocation] = useState<'all' | 'WH-JKT' | 'STORE-BDG'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Transfer form state
  const [transferSku, setTransferSku] = useState('AP-TS-BLK-L');
  const [transferFrom, setTransferFrom] = useState<'STORE-BDG' | 'WH-JKT'>('STORE-BDG');
  const [transferTo, setTransferTo] = useState<'STORE-BDG' | 'WH-JKT'>('WH-JKT');
  const [transferQty, setTransferQty] = useState(1);

  const filteredStock = stock.filter((s) => {
    const matchLoc = filterLocation === 'all' || s.location_id === filterLocation;
    const matchSearch =
      searchQuery === '' ||
      s.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLoc && matchSearch;
  });

  const totalOnHand = stock.reduce((sum, s) => sum + s.on_hand, 0);
  const totalReserved = stock.reduce((sum, s) => sum + s.reserved, 0);
  const totalAvailable = stock.reduce((sum, s) => sum + s.available, 0);

  // Total valuation calculation
  const totalValuation = stock.reduce((sum, s) => {
    const p = products.find((prod) => prod.sku === s.sku);
    const cost = p?.cost_idr || 0;
    return sum + s.on_hand * cost;
  }, 0);

  // T-14 Baseline Check
  const s00007Stock = stock.find((s) => s.sku === 'AP-TS-BLK-M' && s.location_id === 'WH-JKT');

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    executeInternalTransfer(transferSku, transferFrom, transferTo, transferQty);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-07"
        flowHint="S-07 Pantau stok & transfer antarlokasi (WH-JKT ➔ STORE-BDG)"
        title="Stock Overview & Transfers"
        subtitle="Saldo Fisik (On Hand), Reservasi, Tersedia, dan Transfer Lintas Lokasi (SR-04, SR-12)"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        extraActions={
          <div className="flex items-center gap-1 bg-[#F5F0E8] p-1 rounded-lg border border-[#E7E3DD] text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'overview' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983]'
              }`}
            >
              Saldo Stok ({stock.length})
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'transfers' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983]'
              }`}
            >
              Transfer Antar Lokasi ({transfers.length})
            </button>
            <button
              onClick={() => setActiveTab('moves')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'moves' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983]'
              }`}
            >
              Mutasi Riwayat ({stockMoves.length})
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] shadow-2xs">
            <div className="text-[11px] text-[#8C8983] uppercase tracking-wider">Total On Hand Fisik</div>
            <div className="text-2xl font-bold font-mono text-[#171717] mt-1">{totalOnHand} pcs</div>
            <div className="text-[10px] text-[#8C8983] mt-0.5">Baseline: 106 unit</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] shadow-2xs">
            <div className="text-[11px] text-[#8C8983] uppercase tracking-wider">Total Reserved (Dipesan)</div>
            <div className="text-2xl font-bold font-mono text-[#C18B42] mt-1">{totalReserved} pcs</div>
            <div className="text-[10px] text-[#8C8983] mt-0.5">S00007 menahan stok</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] shadow-2xs">
            <div className="text-[11px] text-[#8C8983] uppercase tracking-wider">Available (Siap Jual)</div>
            <div className="text-2xl font-bold font-mono text-[#54745B] mt-1">{totalAvailable} pcs</div>
            <div className="text-[10px] text-[#8C8983] mt-0.5">On Hand - Reserved</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] shadow-2xs">
            <div className="text-[11px] text-[#8C8983] uppercase tracking-wider">Nilai Total Persediaan</div>
            <div className="text-xl font-bold font-mono text-[#171717] mt-1">
              Rp{totalValuation.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#8C8983] mt-0.5">Baseline: Rp11.140.000</div>
          </div>
        </div>

        {/* Spotlight Verification T-14: AP-TS-BLK-M in WH-JKT */}
        {s00007Stock && (
          <div className="p-4 rounded-xl bg-[#171717] text-white border border-[#2E2E2E] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C18B42]/20 border border-[#C18B42]/40 flex items-center justify-center text-[#C18B42]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#C18B42] uppercase tracking-wider font-semibold">
                  Validasi Fixture T-14 (SR-04, SR-11)
                </div>
                <div className="text-sm font-bold text-white">
                  Stok AP-TS-BLK-M di WH-JKT (Gudang Jakarta)
                </div>
                <div className="text-xs text-[#A6A29A]">
                  Reservasi pesanan S00007 menahan 3 unit tanpa mengurangi On Hand fisik.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#222222] px-4 py-2 rounded-lg border border-[#333333] font-mono text-xs">
              <div>
                <span className="text-[#8C8983] block text-[10px]">On Hand</span>
                <span className="font-bold text-white text-sm">{s00007Stock.on_hand}</span>
              </div>
              <div className="border-l border-[#333333] pl-4">
                <span className="text-[#C18B42] block text-[10px]">Reserved (S00007)</span>
                <span className="font-bold text-[#C18B42] text-sm">{s00007Stock.reserved}</span>
              </div>
              <div className="border-l border-[#333333] pl-4">
                <span className="text-[#54745B] block text-[10px]">Available</span>
                <span className="font-bold text-[#54745B] text-sm">{s00007Stock.available}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Stock Overview Table */}
        {activeTab === 'overview' && (
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-sm text-[#171717]">Tabel Saldo Persediaan per SKU & Lokasi</h3>
                <div className="flex gap-1 text-xs">
                  <button
                    onClick={() => setFilterLocation('all')}
                    className={`px-2.5 py-0.5 rounded transition-colors ${
                      filterLocation === 'all' ? 'bg-[#171717] text-white font-medium' : 'text-[#8C8983] hover:text-[#171717]'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setFilterLocation('WH-JKT')}
                    className={`px-2.5 py-0.5 rounded transition-colors ${
                      filterLocation === 'WH-JKT' ? 'bg-[#171717] text-white font-medium' : 'text-[#8C8983] hover:text-[#171717]'
                    }`}
                  >
                    WH-JKT
                  </button>
                  <button
                    onClick={() => setFilterLocation('STORE-BDG')}
                    className={`px-2.5 py-0.5 rounded transition-colors ${
                      filterLocation === 'STORE-BDG' ? 'bg-[#171717] text-white font-medium' : 'text-[#8C8983] hover:text-[#171717]'
                    }`}
                  >
                    STORE-BDG
                  </button>
                </div>
              </div>
              <span className="text-xs text-[#8C8983] font-mono">{filteredStock.length} Baris Data</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F0E8] text-[#8C8983] uppercase tracking-wider font-semibold border-b border-[#E7E3DD]">
                  <tr>
                    <th className="py-3 px-4">Lokasi</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Nama Produk</th>
                    <th className="py-3 px-3">Ukuran</th>
                    <th className="py-3 px-3">Warna</th>
                    <th className="py-3 px-4 text-right">On Hand</th>
                    <th className="py-3 px-4 text-right">Reserved</th>
                    <th className="py-3 px-4 text-right">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DD]">
                  {filteredStock.map((item, idx) => {
                    const prod = products.find((p) => p.sku === item.sku);

                    return (
                      <tr key={idx} className="hover:bg-[#F9F7F2] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#171717]">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              item.location_id === 'WH-JKT'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {item.location_id}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{item.sku}</td>
                        <td className="py-3 px-4 font-medium text-[#171717]">{prod?.product_name}</td>
                        <td className="py-3 px-3">{prod?.size}</td>
                        <td className="py-3 px-3 text-[#8C8983]">{prod?.color}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">{item.on_hand}</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-[#C18B42]">{item.reserved}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#54745B]">{item.available}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Internal Transfer Form & History */}
        {activeTab === 'transfers' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Transfer Execution Form */}
            <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-6 md:col-span-1">
              <div className="flex items-center gap-2 mb-4 border-b border-[#E7E3DD] pb-3">
                <ArrowRightLeft className="w-4 h-4 text-[#C18B42]" />
                <h3 className="font-bold text-sm text-[#171717]">Transfer Antar Lokasi (SR-12)</h3>
              </div>

              <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#8C8983] mb-1">SKU Produk</label>
                  <select
                    value={transferSku}
                    onChange={(e) => setTransferSku(e.target.value)}
                    className="w-full bg-[#F5F0E8] p-2 rounded-lg border border-[#E7E3DD] font-mono font-semibold"
                  >
                    {products.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} - {p.product_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8C8983] mb-1">Dari Lokasi (Source)</label>
                    <select
                      value={transferFrom}
                      onChange={(e) => setTransferFrom(e.target.value as any)}
                      className="w-full bg-[#F5F0E8] p-2 rounded-lg border border-[#E7E3DD] font-mono"
                    >
                      <option value="STORE-BDG">STORE-BDG</option>
                      <option value="WH-JKT">WH-JKT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8C8983] mb-1">Ke Lokasi (Dest)</label>
                    <select
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value as any)}
                      className="w-full bg-[#F5F0E8] p-2 rounded-lg border border-[#E7E3DD] font-mono"
                    >
                      <option value="WH-JKT">WH-JKT</option>
                      <option value="STORE-BDG">STORE-BDG</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#8C8983] mb-1">Kuantitas Pindah</label>
                  <input
                    type="number"
                    min="1"
                    value={transferQty}
                    onChange={(e) => setTransferQty(Number(e.target.value))}
                    className="w-full bg-[#F5F0E8] p-2 rounded-lg border border-[#E7E3DD] font-mono font-bold"
                  />
                </div>

                <div className="p-3 rounded-lg bg-[#F5F0E8] text-[11px] text-[#8C8983] space-y-1">
                  <div><strong>Kaidah SR-12:</strong></div>
                  <div>- Mengurangi lokasi asal, menambah tujuan dengan jumlah sama.</div>
                  <div>- Total unit dan total nilai persediaan perusahaan tetap tidak berubah.</div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#171717] hover:bg-[#282828] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Validasi Transfer (T-15)</span>
                </button>
              </form>
            </div>

            {/* Transfer History Table */}
            <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-6 md:col-span-2">
              <h3 className="font-bold text-sm text-[#171717] mb-4 border-b border-[#E7E3DD] pb-3">
                Riwayat Dokumen Transfer Lintas Lokasi
              </h3>

              {transfers.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#8C8983]">
                  Belum ada dokumen transfer terekam. Gunakan form di sebelah kiri untuk memindahkan barang.
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">No. Transfer</th>
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Dari</th>
                        <th className="py-2.5 px-3">Tujuan</th>
                        <th className="py-2.5 px-3 text-right">Kuantitas</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E3DD]">
                      {transfers.map((t) => (
                        <tr key={t.transfer_id}>
                          <td className="py-3 px-3 font-mono font-bold text-[#C18B42]">{t.transfer_id}</td>
                          <td className="py-3 px-3">{t.date}</td>
                          <td className="py-3 px-3 font-mono">{t.sku}</td>
                          <td className="py-3 px-3 font-semibold">{t.source_location}</td>
                          <td className="py-3 px-3 font-semibold">{t.dest_location}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold">{t.quantity} pcs</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#54745B]/10 text-[#54745B]">
                              {t.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Stock Move History */}
        {activeTab === 'moves' && (
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#171717]" />
                <h3 className="font-bold text-sm text-[#171717]">Jejak Mutasi Persediaan Fisik (Stock Moves)</h3>
              </div>
              <span className="text-xs text-[#8C8983] font-mono">{stockMoves.length} Catatan Mutasi</span>
            </div>

            {stockMoves.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#8C8983]">
                Belum ada pergerakan stok terekam. Mutasi terjadi saat Delivery Order, Receipt QA, POS, Transfer, atau Retur divalidasi.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F5F0E8] text-[#8C8983] uppercase tracking-wider font-semibold border-b border-[#E7E3DD]">
                    <tr>
                      <th className="py-2.5 px-4">Move ID</th>
                      <th className="py-2.5 px-4">Tanggal</th>
                      <th className="py-2.5 px-4">SKU</th>
                      <th className="py-2.5 px-4">Dari</th>
                      <th className="py-2.5 px-4">Tujuan</th>
                      <th className="py-2.5 px-4 text-right">Kuantitas</th>
                      <th className="py-2.5 px-4 text-right">Nilai Total</th>
                      <th className="py-2.5 px-4">Dokumen Referensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3DD]">
                    {stockMoves.map((m) => (
                      <tr key={m.move_id}>
                        <td className="py-3 px-4 font-mono font-bold text-[#171717]">{m.move_id}</td>
                        <td className="py-3 px-4 text-[#8C8983]">{m.date}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{m.sku}</td>
                        <td className="py-3 px-4">{m.from_location}</td>
                        <td className="py-3 px-4">{m.to_location}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">{m.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold">
                          Rp{m.total_value.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#54745B] font-semibold">
                          {m.reference_doc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
