import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBar } from '../common/StatusBar';
import { SmartButtons } from '../common/SmartButtons';
import { Chatter } from '../common/Chatter';
import { Receipt, Check, CreditCard, Truck, BookOpen, Lock, AlertTriangle } from 'lucide-react';

export const CustomerInvoiceModule: React.FC = () => {
  const {
    customerInvoices,
    postCustomerInvoice,
    createCustomerInvoiceFromDelivery,
    setActiveApp,
    setActiveView,
    addNotification,
  } = useERP();

  const [selectedInvId, setSelectedInvId] = useState<string>(
    customerInvoices[0]?.invoice_id || 'INV/2026/0007'
  );

  const currentInvoice =
    customerInvoices.find((i) => i.invoice_id === selectedInvId) || customerInvoices[0];

  const handlePostInvoice = () => {
    if (!currentInvoice) return;
    postCustomerInvoice(currentInvoice.invoice_id);
  };

  const handleTestOverBilling = () => {
    // Try to invoice 3 units when only 2 delivered (T-21)
    createCustomerInvoiceFromDelivery('WH/OUT/00007', 3);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-10"
        flowHint="S-10 Tagih pelanggan & buat faktur ➔ S-12 Register Payment (SR-13)"
        title="Customer Invoice Form"
        subtitle="Faktur Pelanggan Berbasis Kuantitas Terkirim (SR-02) & Pengakuan Piutang (F-09, F-14)"
        extraActions={
          customerInvoices.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#8C8983]">Pilih Invoice:</span>
              <select
                value={selectedInvId}
                onChange={(e) => setSelectedInvId(e.target.value)}
                className="bg-white border border-[#E7E3DD] rounded-lg px-2.5 py-1 font-mono font-bold text-[#171717]"
              >
                {customerInvoices.map((i) => (
                  <option key={i.invoice_id} value={i.invoice_id}>
                    {i.invoice_id} - {i.customer_id} ({i.status})
                  </option>
                ))}
              </select>
            </div>
          )
        }
      />

      {currentInvoice ? (
        <>
          <StatusBar
            stages={[
              { key: 'draft', label: 'Draft' },
              { key: 'posted', label: 'Posted' },
              { key: 'partially_paid', label: 'Partially Paid' },
              { key: 'paid', label: 'Paid' },
            ]}
            currentStage={currentInvoice.status}
            actionButtons={
              <div className="flex items-center gap-2">
                {currentInvoice.status === 'draft' ? (
                  <>
                    <button
                      onClick={handlePostInvoice}
                      className="px-3.5 py-1.5 bg-[#54745B] hover:bg-[#435e49] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Post Customer Invoice (T-20)</span>
                    </button>

                    <button
                      onClick={handleTestOverBilling}
                      className="px-3 py-1.5 bg-white border border-[#B94B4B] text-[#B94B4B] hover:bg-red-50 text-xs font-medium rounded-lg flex items-center gap-1"
                      title="Uji Penagihan Melebihi Pengiriman (T-21)"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Uji Tagih 3 Unit Terkirim 2 (T-21)</span>
                    </button>
                  </>
                ) : currentInvoice.status !== 'paid' ? (
                  <button
                    onClick={() => {
                      setActiveApp('accounting');
                      setActiveView('register_payment');
                    }}
                    className="px-3.5 py-1.5 bg-[#171717] hover:bg-[#282828] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#C18B42]" />
                    <span>Register Payment (F-15)</span>
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
                    label: 'Delivery Order',
                    count: currentInvoice.delivery_id,
                    icon: Truck,
                    onClick: () => {
                      setActiveApp('inventory');
                      setActiveView('delivery_orders');
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
                    {currentInvoice.invoice_id}
                  </span>
                  <h2 className="text-2xl font-bold text-[#171717] mt-1.5">Customer Invoice (Faktur Penjualan)</h2>
                  <div className="text-xs text-[#8C8983] mt-1">
                    Pelanggan: <span className="font-semibold text-[#171717]">{currentInvoice.customer_id}</span> · Pesanan Asal: {currentInvoice.source_so_id} · Delivery: {currentInvoice.delivery_id}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#8C8983]">Total Tagihan (Rp)</div>
                  <div className="text-2xl font-bold font-mono text-[#171717]">
                    Rp{currentInvoice.total_amount.toLocaleString()}
                  </div>
                  <div className="text-xs font-mono font-semibold text-[#B94B4B] mt-0.5">
                    Sisa Residual: Rp{currentInvoice.residual.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Invoice lines table */}
              <div className="mb-6">
                <div className="border border-[#E7E3DD] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                      <tr>
                        <th className="py-2.5 px-4">SKU</th>
                        <th className="py-2.5 px-4">Deskripsi Produk</th>
                        <th className="py-2.5 px-4 text-right">Qty Ditagih (Terkirim)</th>
                        <th className="py-2.5 px-4 text-right">Harga Satuan</th>
                        <th className="py-2.5 px-4 text-right">PPN 11%</th>
                        <th className="py-2.5 px-4 text-right">Total Baris</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E3DD]">
                      {currentInvoice.lines.map((line) => (
                        <tr key={line.sku}>
                          <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{line.sku}</td>
                          <td className="py-3 px-4 font-medium text-[#171717]">{line.product_name}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">{line.quantity} pcs</td>
                          <td className="py-3 px-4 text-right font-mono">Rp{line.unit_price.toLocaleString()}</td>
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

                {/* Calculation box */}
                <div className="flex justify-end mt-4">
                  <div className="w-72 space-y-2 text-xs font-mono p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD]">
                    <div className="flex justify-between">
                      <span className="text-[#8C8983]">Subtotal DPP:</span>
                      <span className="font-semibold text-[#171717]">Rp{currentInvoice.untaxed_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8983]">PPN Keluaran 11%:</span>
                      <span className="text-[#171717]">Rp{currentInvoice.tax_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E7E3DD] pt-1.5 font-bold">
                      <span>Total Tagihan:</span>
                      <span>Rp{currentInvoice.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#54745B]">
                      <span>Sudah Dibayar:</span>
                      <span>Rp{currentInvoice.amount_paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#B94B4B] border-t border-[#E7E3DD] pt-1">
                      <span>Sisa Piutang (Residual):</span>
                      <span>Rp{currentInvoice.residual.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Chatter documentId={currentInvoice.invoice_id} module="INVOICING" />
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-xs text-[#8C8983]">
          Belum ada Customer Invoice. Validasi Delivery Order terlebih dahulu untuk menerbitkan invoice berbasis kuantitas terkirim (SR-02).
        </div>
      )}
    </div>
  );
};
