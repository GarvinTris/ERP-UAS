import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBar } from '../common/StatusBar';
import { SmartButtons } from '../common/SmartButtons';
import { Chatter } from '../common/Chatter';
import { RotateCcw, Check, Receipt, Truck, BookOpen, AlertOctagon, Plus } from 'lucide-react';

export const ReturnsModule: React.FC = () => {
  const {
    returns,
    creditNotes,
    deliveryOrders,
    customerInvoices,
    processCustomerReturn,
    issueCreditNoteForReturn,
    setActiveApp,
    setActiveView,
    addNotification,
  } = useERP();

  const [selectedReturnId, setSelectedReturnId] = useState<string>(
    returns[0]?.return_id || 'RET/2026/0007'
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [returnQtyInput, setReturnQtyInput] = useState(1);
  const [acceptedQtyInput, setAcceptedQtyInput] = useState(1);
  const [rejectedQtyInput, setRejectedQtyInput] = useState(0);
  const [returnReason, setReturnReason] = useState('Ukuran tidak pas pada saat fitting');

  const currentReturn = returns.find((r) => r.return_id === selectedReturnId) || returns[0];

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const d = deliveryOrders[0] || { delivery_id: 'WH/OUT/00007', source_so_id: 'S00007' };
    const inv = customerInvoices[0] || { invoice_id: 'INV/2026/0007' };

    const res = processCustomerReturn(
      d.delivery_id,
      inv.invoice_id,
      'AP-TS-BLK-M',
      returnQtyInput,
      acceptedQtyInput,
      rejectedQtyInput,
      returnReason
    );

    if (res.success && res.returnId) {
      setSelectedReturnId(res.returnId);
      setShowCreateModal(false);
    }
  };

  const handleIssueCreditNote = () => {
    if (!currentReturn) return;
    issueCreditNoteForReturn(currentReturn.return_id, currentReturn.accepted_qty);
  };

  const handleTestT31OverCredit = () => {
    if (!currentReturn) return;
    // Try to issue Credit Note for 2 units when only 1 return accepted (T-31)
    issueCreditNoteForReturn(currentReturn.return_id, 2);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-15"
        flowHint="S-15 Retur barang & credit note ➔ S-13 Jurnal Pembalikan HPP & Piutang (SR-07)"
        title="Customer Returns & Credit Note"
        subtitle="Alur Pengembalian Fisik, Inspeksi Gudang, Pembalikan HPP & Nota Kredit (SR-07, F-17)"
        onCreateNew={() => setShowCreateModal(true)}
        createButtonLabel="Proses Retur Pelanggan"
        extraActions={
          returns.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#8C8983]">Pilih Retur:</span>
              <select
                value={selectedReturnId}
                onChange={(e) => setSelectedReturnId(e.target.value)}
                className="bg-white border border-[#E7E3DD] rounded-lg px-2.5 py-1 font-mono font-bold text-[#171717]"
              >
                {returns.map((r) => (
                  <option key={r.return_id} value={r.return_id}>
                    {r.return_id} - {r.customer_id} ({r.status})
                  </option>
                ))}
              </select>
            </div>
          )
        }
      />

      {currentReturn ? (
        <>
          <StatusBar
            stages={[
              { key: 'draft', label: 'Pengajuan Retur' },
              { key: 'inspected', label: 'Barang Fisik Diinspeksi' },
              { key: 'done', label: 'Credit Note Terbit' },
            ]}
            currentStage={currentReturn.status}
            actionButtons={
              <div className="flex items-center gap-2">
                {currentReturn.status !== 'done' ? (
                  <>
                    <button
                      onClick={handleIssueCreditNote}
                      className="px-3.5 py-1.5 bg-[#54745B] hover:bg-[#435e49] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terbitkan Credit Note ({currentReturn.accepted_qty} Unit Layak) (T-30)</span>
                    </button>

                    <button
                      onClick={handleTestT31OverCredit}
                      className="px-3 py-1.5 bg-white border border-[#B94B4B] text-[#B94B4B] hover:bg-red-50 text-xs font-medium rounded-lg flex items-center gap-1"
                      title="Uji Coba Terbitkan CN 2 Unit saat Retur 1 Unit (T-31)"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Uji CN 2 Unit (T-31)</span>
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-[#54745B] bg-[#54745B]/10 px-3 py-1 rounded-md border border-[#54745B]/20">
                    Credit Note {currentReturn.credit_note_id} Telah Dibukukan
                  </span>
                )}
              </div>
            }
          />

          <div className="p-6 max-w-5xl mx-auto w-full">
            <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-8">
              <SmartButtons
                buttons={[
                  {
                    label: 'Delivery Asal',
                    count: currentReturn.delivery_id,
                    icon: Truck,
                    onClick: () => {
                      setActiveApp('inventory');
                      setActiveView('delivery_orders');
                    },
                  },
                  {
                    label: 'Faktur Asal',
                    count: currentReturn.invoice_id,
                    icon: Receipt,
                    onClick: () => {
                      setActiveApp('invoicing');
                      setActiveView('invoices');
                    },
                  },
                  {
                    label: 'Credit Note',
                    count: currentReturn.credit_note_id || 'Belum Terbit',
                    icon: RotateCcw,
                  },
                  {
                    label: 'Jurnal Akuntansi',
                    icon: BookOpen,
                    onClick: () => {
                      setActiveApp('accounting');
                      setActiveView('journals');
                    },
                  },
                ]}
              />

              <div className="flex items-start justify-between border-b border-[#E7E3DD] pb-6 mb-6">
                <div>
                  <span className="font-mono text-xs font-bold text-[#C18B42] bg-[#C18B42]/10 px-2.5 py-0.5 rounded">
                    {currentReturn.return_id}
                  </span>
                  <h2 className="text-2xl font-bold text-[#171717] mt-1.5">Customer Return & Credit Note (S-15)</h2>
                  <div className="text-xs text-[#8C8983] mt-1">
                    Pelanggan: <span className="font-semibold text-[#171717]">{currentReturn.customer_id}</span> · Tanggal Retur: {currentReturn.date} · Alasan: {currentReturn.reason}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#8C8983]">Status Dokumen</div>
                  <div className="text-base font-bold uppercase tracking-wider text-[#171717]">
                    {currentReturn.status}
                  </div>
                </div>
              </div>

              {/* Table matching S-15 wireframe: SKU, Delivered, Returned, Accepted, Credited */}
              <div className="mb-6">
                <div className="border border-[#E7E3DD] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                      <tr>
                        <th className="py-2.5 px-4">SKU</th>
                        <th className="py-2.5 px-4 text-right">Delivered (Terkirim)</th>
                        <th className="py-2.5 px-4 text-right">Returned (Diajukan)</th>
                        <th className="py-2.5 px-4 text-right">Accepted (Lolos QC Gudang)</th>
                        <th className="py-2.5 px-4 text-right">Credited (CN Berhak)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E3DD]">
                      <tr>
                        <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{currentReturn.sku}</td>
                        <td className="py-3 px-4 text-right font-mono">{currentReturn.delivered_qty} pcs</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">{currentReturn.returned_qty} pcs</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#54745B]">{currentReturn.accepted_qty} pcs</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#C18B42]">
                          {currentReturn.status === 'done' ? `${currentReturn.accepted_qty} pcs` : 'Menunggu CN'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inspection details */}
              <div className="p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD] text-xs text-[#171717] space-y-2 mb-6">
                <div className="font-bold">Laporan Pemeriksaan Gudang & Pembalikan Akuntansi (SR-07):</div>
                <div className="text-[#8C8983]">{currentReturn.inspection_notes}</div>
                <div className="pt-2 border-t border-[#E7E3DD] flex items-center justify-between font-mono">
                  <span>Pembalikan HPP (Dr 1200 Persediaan / Cr 5000 HPP):</span>
                  <span className="font-bold text-[#54745B]">Rp80.000</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Nilai Credit Note (+PPN 11%):</span>
                  <span className="font-bold text-[#171717]">Rp166.500</span>
                </div>
              </div>

              <Chatter documentId={currentReturn.return_id} module="RETURNS" />
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-xs text-[#8C8983]">
          Belum ada pengajuan retur. Klik tombol "Proses Retur Pelanggan" di atas untuk membuat retur baru dari pengiriman yang telah divalidasi.
        </div>
      )}

      {/* Modal for creating return */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFEFC] rounded-2xl max-w-lg w-full border border-[#E7E3DD] shadow-2xl p-6 text-[#171717]">
            <h3 className="font-bold text-base mb-4">Pengajuan & Inspeksi Retur Pelanggan (SR-07)</h3>
            <form onSubmit={handleCreateReturn} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8C8983] mb-1">SKU Barang yang Diretur</label>
                <div className="font-mono font-bold text-[#171717]">AP-TS-BLK-M (Kaos Essential Hitam M)</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#8C8983] mb-1">Qty Diretur</label>
                  <input
                    type="number"
                    min="1"
                    value={returnQtyInput}
                    onChange={(e) => setReturnQtyInput(Number(e.target.value))}
                    className="w-full bg-[#F5F0E8] p-2 rounded-lg border font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#54745B] font-semibold mb-1">Accepted (QC Lolos)</label>
                  <input
                    type="number"
                    min="0"
                    value={acceptedQtyInput}
                    onChange={(e) => setAcceptedQtyInput(Number(e.target.value))}
                    className="w-full bg-[#F5F0E8] p-2 rounded-lg border font-mono font-bold text-[#54745B]"
                  />
                </div>
                <div>
                  <label className="block text-[#B94B4B] font-semibold mb-1">Rejected (Rusak)</label>
                  <input
                    type="number"
                    min="0"
                    value={rejectedQtyInput}
                    onChange={(e) => setRejectedQtyInput(Number(e.target.value))}
                    className="w-full bg-[#F5F0E8] p-2 rounded-lg border font-mono font-bold text-[#B94B4B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8C8983] mb-1">Alasan Retur</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#54745B]/10 text-[#54745B] text-[11px]">
                *Unit lolos inspeksi akan mengembalikan stok gudang WH-JKT dan membalik HPP secara otomatis (T-30).
              </div>

              <div className="pt-4 border-t border-[#E7E3DD] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-[#F5F0E8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#282828] font-medium"
                >
                  Simpan & Inspeksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
