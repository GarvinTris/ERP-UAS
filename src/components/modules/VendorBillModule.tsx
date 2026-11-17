import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBar } from '../common/StatusBar';
import { SmartButtons } from '../common/SmartButtons';
import { Chatter } from '../common/Chatter';
import { Receipt, Check, CreditCard, Truck, BookOpen, AlertOctagon } from 'lucide-react';

export const VendorBillModule: React.FC = () => {
  const {
    vendorBills,
    postVendorBill,
    registerVendorPayment,
    setActiveApp,
    setActiveView,
  } = useERP();

  const [selectedBillId, setSelectedBillId] = useState<string>(
    vendorBills[0]?.bill_id || 'BILL/2026/0007'
  );

  const currentBill =
    vendorBills.find((b) => b.bill_id === selectedBillId) || vendorBills[0];

  const handlePostBill = () => {
    if (!currentBill) return;
    postVendorBill(currentBill.bill_id);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        title="Vendor Bill Form"
        subtitle="Pencocokan Tiga Arah (Three-Way Matching PO - Receipt - Bill) & Pengakuan Utang Dagang"
        extraActions={
          vendorBills.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#8C8983]">Pilih Tagihan:</span>
              <select
                value={selectedBillId}
                onChange={(e) => setSelectedBillId(e.target.value)}
                className="bg-white border border-[#E7E3DD] rounded-lg px-2.5 py-1 font-mono font-bold text-[#171717]"
              >
                {vendorBills.map((b) => (
                  <option key={b.bill_id} value={b.bill_id}>
                    {b.bill_id} - {b.vendor_id} ({b.status})
                  </option>
                ))}
              </select>
            </div>
          )
        }
      />

      {currentBill ? (
        <>
          <StatusBar
            stages={[
              { key: 'draft', label: 'Draft Bill' },
              { key: 'posted', label: 'Posted (Utang Diakui)' },
              { key: 'partially_paid', label: 'Partially Paid' },
              { key: 'paid', label: 'Paid in Full' },
            ]}
            currentStage={currentBill.status}
            actionButtons={
              <div className="flex items-center gap-2">
                {currentBill.status === 'draft' ? (
                  <button
                    onClick={handlePostBill}
                    className="px-3.5 py-1.5 bg-[#54745B] hover:bg-[#435e49] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Post Vendor Bill</span>
                  </button>
                ) : currentBill.status !== 'paid' ? (
                  <button
                    onClick={() => {
                      if (!currentBill) return;
                      registerVendorPayment(currentBill.bill_id, currentBill.residual, 'bank');
                    }}
                    className="px-3.5 py-1.5 bg-[#171717] hover:bg-[#282828] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#C18B42]" />
                    <span>Bayar Utang via Bank Mandiri</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-[#54745B] bg-[#54745B]/10 px-3 py-1 rounded-md border border-[#54745B]/20">
                    Lunas (Paid in Full)
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
                    label: 'Receipt QA Terkait',
                    count: currentBill.receipt_id,
                    icon: Truck,
                    onClick: () => {
                      setActiveApp('inventory');
                      setActiveView('receipts');
                    },
                  },
                  {
                    label: 'Journal Entries',
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
                    {currentBill.bill_id}
                  </span>
                  <h2 className="text-2xl font-bold text-[#171717] mt-1.5">Vendor Bill (Tagihan Pemasok)</h2>
                  <div className="text-xs text-[#8C8983] mt-1">
                    Pemasok: <span className="font-semibold text-[#171717]">{currentBill.vendor_id}</span> · PO: {currentBill.source_po_id} · Receipt: {currentBill.receipt_id}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#8C8983]">Total Utang (AP)</div>
                  <div className="text-2xl font-bold font-mono text-[#171717]">
                    Rp{currentBill.total_amount.toLocaleString()}
                  </div>
                  <div className="text-xs font-mono font-semibold text-[#B94B4B] mt-0.5">
                    Sisa Utang: Rp{currentBill.residual.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Three-Way Matching Comparison Box */}
              <div className="p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD] mb-6 text-xs font-mono">
                <div className="font-bold text-[#171717] mb-2 flex items-center justify-between font-sans">
                  <span>Audit Pencocokan Tiga Arah (Three-Way Match Verification)</span>
                  <span className="text-[#54745B] text-xs font-mono font-semibold">STATUS: VERIFIED OK</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white rounded border border-[#E7E3DD]">
                    <div className="text-[#8C8983] text-[10px]">PO Ordered</div>
                    <div className="font-bold text-sm text-[#171717] mt-0.5">4 pcs</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-[#E7E3DD]">
                    <div className="text-[#8C8983] text-[10px]">Received Fisik</div>
                    <div className="font-bold text-sm text-[#171717] mt-0.5">3 pcs</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-[#E7E3DD]">
                    <div className="text-[#54745B] text-[10px]">QA Accepted</div>
                    <div className="font-bold text-sm text-[#54745B] mt-0.5">3 pcs</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-[#E7E3DD]">
                    <div className="text-[#C18B42] text-[10px]">Billed (Ditagih)</div>
                    <div className="font-bold text-sm text-[#C18B42] mt-0.5">3 pcs</div>
                  </div>
                </div>
              </div>

              {/* Bill lines table */}
              <div className="mb-6">
                <div className="border border-[#E7E3DD] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                      <tr>
                        <th className="py-2.5 px-4">SKU</th>
                        <th className="py-2.5 px-4">Deskripsi Produk</th>
                        <th className="py-2.5 px-4 text-right">Qty Billable (Accepted)</th>
                        <th className="py-2.5 px-4 text-right">Biaya Satuan</th>
                        <th className="py-2.5 px-4 text-right">PPN Masukan (11%)</th>
                        <th className="py-2.5 px-4 text-right">Total Baris</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E3DD]">
                      {currentBill.lines.map((line) => (
                        <tr key={line.sku}>
                          <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{line.sku}</td>
                          <td className="py-3 px-4 font-medium text-[#171717]">{line.product_name}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">
                            {line.qty_billable} pcs
                          </td>
                          <td className="py-3 px-4 text-right font-mono">Rp{line.unit_cost.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono text-[#8C8983]">
                            Rp{line.tax_amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">
                            Rp{line.line_total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-4">
                  <div className="w-72 space-y-2 text-xs font-mono p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD]">
                    <div className="flex justify-between">
                      <span className="text-[#8C8983]">Subtotal DPP (GRNI):</span>
                      <span className="font-semibold text-[#171717]">Rp{currentBill.untaxed_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8983]">PPN Masukan 11%:</span>
                      <span className="text-[#171717]">Rp{currentBill.tax_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E7E3DD] pt-1.5 font-bold">
                      <span>Total Utang (AP):</span>
                      <span>Rp{currentBill.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#54745B]">
                      <span>Sudah Dibayar:</span>
                      <span>Rp{currentBill.amount_paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#B94B4B] border-t border-[#E7E3DD] pt-1">
                      <span>Sisa Utang (Residual):</span>
                      <span>Rp{currentBill.residual.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Chatter documentId={currentBill.bill_id} module="ACCOUNTING" />
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-xs text-[#8C8983]">
          Belum ada Vendor Bill. Lakukan validasi Quality Acceptance pada Receipt terlebih dahulu.
        </div>
      )}
    </div>
  );
};
