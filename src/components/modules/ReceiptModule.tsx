import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBar } from '../common/StatusBar';
import { SmartButtons } from '../common/SmartButtons';
import { Chatter } from '../common/Chatter';
import { Check, ShieldAlert, AlertTriangle, Layers, BookOpen, Package, ArrowRight } from 'lucide-react';

export const ReceiptModule: React.FC = () => {
  const {
    receipts,
    validateReceiptWithQA,
    createVendorBillFromReceipt,
    setActiveApp,
    setActiveView,
    addNotification,
  } = useERP();

  const [selectedReceiptId, setSelectedReceiptId] = useState<string>(
    receipts[0]?.receipt_id || 'WH/IN/00007'
  );
  const [acceptedQtyInput, setAcceptedQtyInput] = useState<number>(3);
  const [rejectedQtyInput, setRejectedQtyInput] = useState<number>(0);

  const currentReceipt =
    receipts.find((r) => r.receipt_id === selectedReceiptId) || receipts[0];

  const handleValidateQA = () => {
    if (!currentReceipt) return;
    validateReceiptWithQA(currentReceipt.receipt_id, acceptedQtyInput, rejectedQtyInput);
  };

  const handleTestT19RejectBlock = () => {
    if (!currentReceipt) return;
    // Attempt to recognize 4 accepted when 1 is rejected (3+1 = 4 total, user tries 4 accepted + 1 rejected > ordered 4)
    validateReceiptWithQA(currentReceipt.receipt_id, 4, 1);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-09"
        flowHint="S-09 Terima barang & QA ➔ S-11 Vendor Bill Form (SR-06)"
        title="Receipt / Quality Acceptance Form"
        subtitle="Penerimaan Barang Fisik, Pemeriksaan Mutu (QA), & Sisa Pesanan (SR-06)"
        extraActions={
          receipts.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#8C8983]">Pilih Receipt:</span>
              <select
                value={selectedReceiptId}
                onChange={(e) => setSelectedReceiptId(e.target.value)}
                className="bg-white border border-[#E7E3DD] rounded-lg px-2.5 py-1 font-mono font-bold text-[#171717]"
              >
                {receipts.map((r) => (
                  <option key={r.receipt_id} value={r.receipt_id}>
                    {r.receipt_id} - {r.source_po_id} ({r.status})
                  </option>
                ))}
              </select>
            </div>
          )
        }
      />

      {currentReceipt ? (
        <>
          <StatusBar
            stages={[
              { key: 'draft', label: 'Draft Penerimaan' },
              { key: 'confirmed', label: 'Barang Tiba (Inspeksi QC)' },
              { key: 'done', label: 'Diterima Baik (QA Done)' },
            ]}
            currentStage={currentReceipt.status}
            actionButtons={
              <div className="flex items-center gap-2">
                {currentReceipt.status !== 'done' ? (
                  <>
                    <button
                      onClick={handleValidateQA}
                      className="px-3.5 py-1.5 bg-[#54745B] hover:bg-[#435e49] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Validate QA ({acceptedQtyInput} Accepted, {rejectedQtyInput} Rejected)</span>
                    </button>

                    <button
                      onClick={handleTestT19RejectBlock}
                      className="px-3 py-1.5 bg-white border border-[#B94B4B] text-[#B94B4B] hover:bg-red-50 text-xs font-medium rounded-lg flex items-center gap-1"
                      title="Uji Blokir Unit Gagal Inspeksi (T-19)"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Uji Blokir Barang Rejected (T-19)</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      const res = createVendorBillFromReceipt(currentReceipt.receipt_id);
                      if (res.success) {
                        setActiveApp('accounting');
                        setActiveView('vendor_bills');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-[#171717] hover:bg-[#282828] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Package className="w-3.5 h-3.5 text-[#C18B42]" />
                    <span>Create Vendor Bill (F-13)</span>
                  </button>
                )}
              </div>
            }
          />

          <div className="p-6 max-w-5xl mx-auto w-full">
            <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-8">
              <SmartButtons
                buttons={[
                  {
                    label: 'Source PO',
                    count: currentReceipt.source_po_id,
                    icon: Package,
                    onClick: () => {
                      setActiveApp('purchase');
                      setActiveView('po_list');
                    },
                  },
                  {
                    label: 'Jurnal GRNI Terposting',
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
                    {currentReceipt.receipt_id}
                  </span>
                  <h2 className="text-2xl font-bold text-[#171717] mt-1.5">
                    Receipt & Quality Acceptance (S-09)
                  </h2>
                  <div className="text-xs text-[#8C8983] mt-1">
                    Sumber PO: <span className="font-semibold text-[#171717]">{currentReceipt.source_po_id}</span> · Vendor: {currentReceipt.vendor_id} · Lokasi Masuk: {currentReceipt.destination_location}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#8C8983]">Status Penerimaan</div>
                  <div className="text-base font-bold uppercase tracking-wider text-[#171717]">
                    {currentReceipt.status}
                  </div>
                </div>
              </div>

              {/* Receipt Lines Table */}
              <div className="mb-6">
                <div className="border border-[#E7E3DD] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                      <tr>
                        <th className="py-2.5 px-4">SKU</th>
                        <th className="py-2.5 px-4 text-right">Ordered</th>
                        <th className="py-2.5 px-4 text-right">Received Fisik</th>
                        <th className="py-2.5 px-4 text-right">Accepted (Lolos QA)</th>
                        <th className="py-2.5 px-4 text-right">Rejected (Rusak/Cacat)</th>
                        <th className="py-2.5 px-4 text-right">Remaining PO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E3DD]">
                      {currentReceipt.lines.map((line) => (
                        <tr key={line.sku}>
                          <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{line.sku}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">{line.ordered} pcs</td>
                          <td className="py-3 px-4 text-right font-mono">{line.received} pcs</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#54745B]">
                            {currentReceipt.status === 'done' ? (
                              `${line.accepted} pcs`
                            ) : (
                              <input
                                type="number"
                                min="0"
                                max={line.ordered}
                                value={acceptedQtyInput}
                                onChange={(e) => setAcceptedQtyInput(Number(e.target.value))}
                                className="w-20 bg-[#F5F0E8] p-1 text-right rounded border border-[#E7E3DD] font-mono font-bold"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#B94B4B]">
                            {currentReceipt.status === 'done' ? (
                              `${line.rejected} pcs`
                            ) : (
                              <input
                                type="number"
                                min="0"
                                max={line.ordered}
                                value={rejectedQtyInput}
                                onChange={(e) => setRejectedQtyInput(Number(e.target.value))}
                                className="w-20 bg-[#F5F0E8] p-1 text-right rounded border border-[#E7E3DD] font-mono font-bold"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-[#8C8983]">
                            {currentReceipt.status === 'done'
                              ? `${line.remaining} pcs`
                              : `${Math.max(0, line.ordered - acceptedQtyInput)} pcs`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QA Business Rule Notice */}
              <div className="p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD] text-xs text-[#171717] space-y-1">
                <div className="font-semibold">Aturan Bisnis Penerimaan & Akuntansi (SR-06):</div>
                <div className="text-[#8C8983]">
                  Hanya unit yang berstatus <strong>Accepted</strong> (lolos inspeksi mutu) yang berhak menambah saldo persediaan fisik gudang (<code>on_hand</code>) dan menjadi dasar penerbitan Vendor Bill. Unit yang <strong>Rejected</strong> tidak menambah nilai persediaan perusahaan.
                </div>
              </div>

              <Chatter documentId={currentReceipt.receipt_id} module="INVENTORY" />
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-xs text-[#8C8983]">
          Belum ada Receipt aktif. Buka modul Purchase dan klik "Receive Products" pada PO00007 untuk memulai penerimaan.
        </div>
      )}
    </div>
  );
};
