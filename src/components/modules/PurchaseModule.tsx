import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBar } from '../common/StatusBar';
import { SmartButtons } from '../common/SmartButtons';
import { Chatter } from '../common/Chatter';
import { Package, Truck, Receipt, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';

export const PurchaseModule: React.FC = () => {
  const {
    purchaseOrders,
    vendors,
    createReceiptFromPO,
    attemptModifyConfirmedPOQty,
    setActiveApp,
    setActiveView,
    addNotification,
  } = useERP();

  const [selectedPoId, setSelectedPoId] = useState<string>('PO00007');

  const currentPo = purchaseOrders.find((p) => p.po_id === selectedPoId) || purchaseOrders[0];
  const poVendor = vendors.find((v) => v.vendor_id === currentPo?.vendor_id);

  const handleCreateReceipt = () => {
    if (!currentPo) return;
    const r = createReceiptFromPO(currentPo.po_id);
    if (r) {
      setActiveApp('inventory');
      setActiveView('receipts');
      addNotification('success', `Receipt ${r.receipt_id} disiapkan untuk penerimaan barang & inspeksi QA.`);
    }
  };

  const handleTestQtyModification = () => {
    if (!currentPo) return;
    attemptModifyConfirmedPOQty(currentPo.po_id, 7);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-08"
        flowHint="S-08 Buat permintaan pembelian ➔ S-09 Receipt / Quality Acceptance Form"
        title="RFQ / Purchase Order Form"
        subtitle="Pemesanan Pembelian, Pajak Masukan 11%, dan Penguncian Dokumen (SR-05, SR-08)"
        extraActions={
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#8C8983]">Pilih PO:</span>
            <select
              value={selectedPoId}
              onChange={(e) => setSelectedPoId(e.target.value)}
              className="bg-white border border-[#E7E3DD] rounded-lg px-2.5 py-1 font-mono font-bold text-[#171717]"
            >
              {purchaseOrders.map((p) => (
                <option key={p.po_id} value={p.po_id}>
                  {p.po_id} - {p.vendor_id} ({p.status})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {currentPo && (
        <>
          <StatusBar
            stages={[
              { key: 'draft', label: 'RFQ Draft' },
              { key: 'rfq_sent', label: 'RFQ Sent' },
              { key: 'confirmed', label: 'Purchase Order Confirmed' },
              { key: 'done', label: 'Received & Billed' },
            ]}
            currentStage={currentPo.status}
            actionButtons={
              <div className="flex items-center gap-2">
                {currentPo.status === 'confirmed' && (
                  <>
                    <button
                      onClick={handleCreateReceipt}
                      className="px-3.5 py-1.5 bg-[#54745B] hover:bg-[#435e49] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Receive Products / Buat Receipt (F-12)</span>
                    </button>

                    <button
                      onClick={handleTestQtyModification}
                      className="px-3 py-1.5 bg-white border border-[#B94B4B] text-[#B94B4B] hover:bg-red-50 text-xs font-medium rounded-lg flex items-center gap-1"
                      title="Uji Mengganti Qty 4 ke 7 Tanpa Revisi (T-17)"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Uji Ganti Qty ke 7 (T-17)</span>
                    </button>
                  </>
                )}
              </div>
            }
          />

          <div className="p-6 max-w-5xl mx-auto w-full">
            <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-8">
              <SmartButtons
                buttons={[
                  {
                    label: 'Receipts / Penerimaan',
                    count: currentPo.receipt_ids.length,
                    icon: Truck,
                    onClick: () => {
                      setActiveApp('inventory');
                      setActiveView('receipts');
                    },
                  },
                  {
                    label: 'Vendor Bills',
                    count: currentPo.bill_ids.length,
                    icon: Receipt,
                    onClick: () => {
                      setActiveApp('accounting');
                      setActiveView('vendor_bills');
                    },
                  },
                ]}
              />

              <div className="flex items-start justify-between border-b border-[#E7E3DD] pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-sm font-bold text-[#C18B42] bg-[#C18B42]/10 px-2.5 py-0.5 rounded">
                      {currentPo.po_id}
                    </span>
                    {currentPo.is_locked && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8C8983] bg-[#F5F0E8] px-2 py-0.5 rounded">
                        <Lock className="w-3 h-3" /> Locked (Confirmed)
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-[#171717]">Purchase Order (Pemesanan Pembelian)</h2>
                  <div className="text-xs text-[#8C8983] mt-1">
                    Vendor: <span className="text-[#171717] font-semibold">{poVendor?.name} ({currentPo.vendor_id})</span> · Termin: {currentPo.payment_terms}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#8C8983]">Total PO (+PPN Masukan 11%)</div>
                  <div className="text-2xl font-bold font-mono text-[#171717]">
                    Rp{currentPo.total_amount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Order Lines */}
              <div className="mb-6">
                <div className="border border-[#E7E3DD] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                      <tr>
                        <th className="py-2.5 px-4">SKU</th>
                        <th className="py-2.5 px-4">Nama Produk</th>
                        <th className="py-2.5 px-3">Ukuran</th>
                        <th className="py-2.5 px-3">Warna</th>
                        <th className="py-2.5 px-3 text-right">Qty Dipesan</th>
                        <th className="py-2.5 px-4 text-right">Harga Beli Satuan</th>
                        <th className="py-2.5 px-4 text-right">PPN Masukan (11%)</th>
                        <th className="py-2.5 px-4 text-right">Total Baris</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E3DD]">
                      {currentPo.lines.map((l) => (
                        <tr key={l.id}>
                          <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{l.sku}</td>
                          <td className="py-3 px-4 font-medium text-[#171717]">{l.product_name}</td>
                          <td className="py-3 px-3">{l.size}</td>
                          <td className="py-3 px-3 text-[#8C8983]">{l.color}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-[#171717]">{l.quantity} pcs</td>
                          <td className="py-3 px-4 text-right font-mono">Rp{l.unit_cost.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono text-[#8C8983]">
                            Rp{l.tax_amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">
                            Rp{l.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-4">
                  <div className="w-72 space-y-2 text-xs font-mono p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD]">
                    <div className="flex justify-between">
                      <span className="text-[#8C8983]">Subtotal Belum Pajak:</span>
                      <span className="font-semibold text-[#171717]">Rp{currentPo.untaxed_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8983]">PPN Masukan (11%):</span>
                      <span className="text-[#171717]">Rp{currentPo.tax_amount.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-[#E7E3DD] flex justify-between font-bold text-sm text-[#171717]">
                      <span>Total Tagihan PO:</span>
                      <span className="text-base">Rp{currentPo.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Chatter documentId={currentPo.po_id} module="PURCHASE" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
