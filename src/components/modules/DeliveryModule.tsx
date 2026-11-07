import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBar } from '../common/StatusBar';
import { SmartButtons } from '../common/SmartButtons';
import { Chatter } from '../common/Chatter';
import { Truck, Check, Receipt, BookOpen, Layers, Lock, AlertOctagon, RotateCcw } from 'lucide-react';

export const DeliveryModule: React.FC = () => {
  const {
    deliveryOrders,
    validateDeliveryOrder,
    attemptInvalidDeliveryQty,
    createCustomerInvoiceFromDelivery,
    setActiveApp,
    setActiveView,
    addNotification,
  } = useERP();

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(
    deliveryOrders[0]?.delivery_id || 'WH/OUT/00007'
  );
  const [doneUnitsInput, setDoneUnitsInput] = useState<number>(2);

  const currentDelivery =
    deliveryOrders.find((d) => d.delivery_id === selectedDeliveryId) || deliveryOrders[0];

  const handleValidateDelivery = () => {
    if (!currentDelivery) return;
    validateDeliveryOrder(currentDelivery.delivery_id, doneUnitsInput);
  };

  const handleTestOverDelivery = () => {
    if (!currentDelivery) return;
    attemptInvalidDeliveryQty(currentDelivery.delivery_id, 4);
  };

  const handleTestIdempotentRepost = () => {
    if (!currentDelivery) return;
    validateDeliveryOrder(currentDelivery.delivery_id, 2);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-06"
        flowHint="S-06 Siapkan barang ➔ S-10 Customer Invoice Form (SR-02)"
        title="Delivery Order Form"
        subtitle="Validasi Pengiriman Fisik, Backorder Parsial (F-08), dan Pengakuan HPP Otomatis (SR-04, SR-07)"
        extraActions={
          deliveryOrders.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#8C8983]">Pilih Delivery:</span>
              <select
                value={selectedDeliveryId}
                onChange={(e) => setSelectedDeliveryId(e.target.value)}
                className="bg-white border border-[#E7E3DD] rounded-lg px-2.5 py-1 font-mono font-bold text-[#171717]"
              >
                {deliveryOrders.map((d) => (
                  <option key={d.delivery_id} value={d.delivery_id}>
                    {d.delivery_id} - {d.source_so_id} ({d.status})
                  </option>
                ))}
              </select>
            </div>
          )
        }
      />

      {currentDelivery ? (
        <>
          <StatusBar
            stages={[
              { key: 'draft', label: 'Draft' },
              { key: 'confirmed', label: 'Ready for Packing' },
              { key: 'done', label: 'Shipped & Done' },
            ]}
            currentStage={currentDelivery.status}
            actionButtons={
              <div className="flex items-center gap-2">
                {currentDelivery.status !== 'done' ? (
                  <>
                    <button
                      onClick={handleValidateDelivery}
                      className="px-3.5 py-1.5 bg-[#54745B] hover:bg-[#435e49] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Validate Delivery ({doneUnitsInput} Units)</span>
                    </button>

                    <button
                      onClick={handleTestOverDelivery}
                      className="px-3 py-1.5 bg-white border border-[#B94B4B] text-[#B94B4B] hover:bg-red-50 text-xs font-medium rounded-lg flex items-center gap-1"
                      title="Uji Kirim 4 Unit pada Pesanan 3 Unit (T-13)"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Uji Coba Kirim 4 Unit (T-13)</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        const res = createCustomerInvoiceFromDelivery(currentDelivery.delivery_id);
                        if (res.success) {
                          setActiveApp('invoicing');
                          setActiveView('invoices');
                        }
                      }}
                      className="px-3.5 py-1.5 bg-[#171717] hover:bg-[#282828] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#C18B42]" />
                      <span>Create Customer Invoice (F-09)</span>
                    </button>

                    <button
                      onClick={handleTestIdempotentRepost}
                      className="px-3 py-1.5 bg-white border border-[#8C8983] text-[#171717] hover:bg-[#F5F0E8] text-xs font-medium rounded-lg flex items-center gap-1"
                      title="Uji Posting Ulang Ganda / Idempotensi (T-27)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Uji Posting Ulang (T-27)</span>
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
                    label: 'Sales Order Asal',
                    count: currentDelivery.source_so_id,
                    icon: Receipt,
                    onClick: () => {
                      setActiveApp('sales');
                      setActiveView('quotations');
                    },
                  },
                  {
                    label: 'HPP Terposting',
                    count: `Rp${currentDelivery.cogs_posted.toLocaleString()}`,
                    icon: Layers,
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
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#C18B42] bg-[#C18B42]/10 px-2.5 py-0.5 rounded">
                      {currentDelivery.delivery_id}
                    </span>
                    {currentDelivery.is_backorder && (
                      <span className="text-[11px] font-mono font-bold text-[#C18B42] bg-amber-100 px-2 py-0.5 rounded">
                        BACKORDER DARI {currentDelivery.parent_delivery_id}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-[#171717]">Delivery Order (Pengeluaran Barang)</h2>
                  <div className="text-xs text-[#8C8983] mt-1">
                    Sumber Pesanan: <span className="font-semibold text-[#171717]">{currentDelivery.source_so_id}</span> · Lokasi Asal: {currentDelivery.source_location}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#8C8983]">Status Dokumen</div>
                  <div className="text-base font-bold uppercase tracking-wider text-[#171717]">
                    {currentDelivery.status}
                  </div>
                </div>
              </div>

              {/* Delivery Lines Table */}
              <div className="mb-6">
                <div className="border border-[#E7E3DD] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                      <tr>
                        <th className="py-2.5 px-4">SKU</th>
                        <th className="py-2.5 px-4 text-right">Demand (Permintaan)</th>
                        <th className="py-2.5 px-4 text-right">Reserved</th>
                        <th className="py-2.5 px-4 text-right">Done (Kirim Aktual)</th>
                        <th className="py-2.5 px-4 text-right">Backorder Sisa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E3DD]">
                      {currentDelivery.lines.map((line) => (
                        <tr key={line.sku}>
                          <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{line.sku}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">{line.demand} pcs</td>
                          <td className="py-3 px-4 text-right font-mono text-[#8C8983]">{line.reserved} pcs</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#54745B]">
                            {currentDelivery.status === 'done' ? (
                              `${line.done} pcs`
                            ) : (
                              <input
                                type="number"
                                min="1"
                                max={line.demand}
                                value={doneUnitsInput}
                                onChange={(e) => setDoneUnitsInput(Number(e.target.value))}
                                className="w-20 bg-[#F5F0E8] p-1 text-right rounded border border-[#E7E3DD] font-mono font-bold"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[#C18B42] font-semibold">
                            {currentDelivery.status === 'done'
                              ? `${line.backorder} pcs`
                              : `${Math.max(0, line.demand - doneUnitsInput)} pcs`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rules banner */}
              <div className="p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD] text-xs text-[#171717] space-y-1">
                <div className="font-semibold text-[#171717]">Aturan Validasi Pengiriman (SR-04 & SR-07):</div>
                <ul className="list-disc pl-4 text-[#8C8983] space-y-0.5">
                  <li>Validasi pengiriman memotong stok fisik gudang (<code>on_hand</code>) dan reservasi.</li>
                  <li>Sistem otomatis membukukan Harga Pokok Penjualan (Dr 5000 HPP / Cr 1200 Persediaan).</li>
                  <li>Pengiriman parsial memisahkan sisa unit sebagai dokumen backorder yang tetap terhubung.</li>
                  <li>Customer Invoice hanya boleh diterbitkan atas unit yang telah tervalidasi Done (SR-02).</li>
                </ul>
              </div>

              <Chatter documentId={currentDelivery.delivery_id} module="INVENTORY" />
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-xs text-[#8C8983]">
          Belum ada Delivery Order aktif. Konfirmasi Sales Order S00007 terlebih dahulu untuk menghasilkan delivery order.
        </div>
      )}
    </div>
  );
};
