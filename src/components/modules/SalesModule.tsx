import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBar } from '../common/StatusBar';
import { SmartButtons } from '../common/SmartButtons';
import { Chatter } from '../common/Chatter';
import { CreditValidationModal } from '../common/CreditValidationModal';
import { SalesOrder, OrderLineItem } from '../../types/erp';
import {
  Check,
  Truck,
  Receipt,
  Layers,
  Lock,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export const SalesModule: React.FC = () => {
  const {
    salesOrders,
    customers,
    products,
    confirmSalesOrder,
    attemptModifyConfirmedSOPrice,
    createDeliveryOrderForSO,
    createQuotation,
    setActiveApp,
    setActiveView,
    currentUser,
    addNotification,
  } = useERP();

  const [selectedOrderId, setSelectedOrderId] = useState<string>('S00007');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  // New quotation states
  const [newCustomer, setNewCustomer] = useState('C03');
  const [newTerms, setNewTerms] = useState<'NET14' | 'NET30' | 'TUNAI'>('NET14');
  const [newSku, setNewSku] = useState('AP-DR-BLU-M');
  const [newQty, setNewQty] = useState(2);
  const [newDiscount, setNewDiscount] = useState(0);

  const currentOrder = salesOrders.find((s) => s.order_id === selectedOrderId) || salesOrders[0];
  const orderCustomer = customers.find((c) => c.contact_id === currentOrder?.customer_id);

  const handleCreateNewQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.sku === newSku);
    const unitPrice = prod?.sales_price_idr || 150000;
    const subtotal = newQty * unitPrice * (1 - newDiscount / 100);
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;

    const line: OrderLineItem = {
      id: `LINE-${Date.now()}`,
      sku: newSku,
      product_name: prod?.product_name || 'Kaos',
      size: prod?.size || 'M',
      color: prod?.color || 'Hitam',
      quantity: newQty,
      unit_price: unitPrice,
      discount_pct: newDiscount,
      tax_amount: tax,
      subtotal,
      total,
    };

    const newSo = createQuotation({
      customer_id: newCustomer,
      order_date: new Date().toISOString().substring(0, 10),
      expiration_date: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      payment_terms: newTerms,
      warehouse_id: 'WH-JKT',
      salesperson: currentUser?.name || 'Nadya Kinasih',
      lines: [line],
      untaxed_amount: subtotal,
      discount_amount: newQty * unitPrice * (newDiscount / 100),
      tax_amount: tax,
      total_amount: total,
      discount_approved: newDiscount <= 10,
      notes: `Quotation baru dengan diskon ${newDiscount}%.`,
    });

    setSelectedOrderId(newSo.order_id);
    setShowCreateModal(false);
    addNotification('success', `Quotation ${newSo.order_id} berhasil dibuat.`);
  };

  const handleConfirmOrder = () => {
    if (!currentOrder || !orderCustomer) return;

    // Check credit exposure
    const grossNew = currentOrder.total_amount;
    const totalExp = orderCustomer.open_receivable + grossNew;

    if (currentOrder.payment_terms === 'TUNAI' || orderCustomer.payment_terms === 'TUNAI') {
      if (currentOrder.payment_terms !== 'TUNAI') {
        setCreditModalOpen(true);
        return;
      }
    } else if (totalExp > orderCustomer.credit_limit_idr) {
      setCreditModalOpen(true);
      return;
    }

    confirmSalesOrder(currentOrder.order_id);
  };

  const handleTestPriceModification = () => {
    if (!currentOrder) return;
    attemptModifyConfirmedSOPrice(currentOrder.order_id, 120000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-05"
        flowHint="S-05 Buat penawaran harga / SO ➔ S-06 Delivery Order"
        title="Quotation / Sales Order Form"
        subtitle="Pesanan Penjualan, Validasi Kredit (SR-10), Diskon & Penguncian Harga (SR-08), Reservasi Stok (SR-04)"
        onCreateNew={() => setShowCreateModal(true)}
        createButtonLabel="Buat Penawaran / SO Baru"
        extraActions={
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#8C8983]">Pilih Dokumen:</span>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="bg-white border border-[#E7E3DD] rounded-lg px-2.5 py-1 font-mono font-bold text-[#171717]"
            >
              {salesOrders.map((so) => (
                <option key={so.order_id} value={so.order_id}>
                  {so.order_id} - {so.customer_id} ({so.status})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {currentOrder && (
        <>
          {/* Status Bar */}
          <StatusBar
            stages={[
              { key: 'draft', label: 'Quotation Draft' },
              { key: 'sent', label: 'Quotation Sent' },
              { key: 'confirmed', label: 'Sales Order Confirmed' },
              { key: 'done', label: 'Done / Delivered' },
            ]}
            currentStage={currentOrder.status}
            actionButtons={
              <div className="flex items-center gap-2">
                {currentOrder.status !== 'confirmed' && currentOrder.status !== 'done' && (
                  <button
                    onClick={handleConfirmOrder}
                    className="px-3.5 py-1.5 bg-[#171717] hover:bg-[#282828] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 text-[#54745B]" />
                    <span>Confirm Order (SR-01, SR-10)</span>
                  </button>
                )}

                {currentOrder.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => {
                        const d = createDeliveryOrderForSO(currentOrder.order_id);
                        if (d) {
                          setActiveApp('inventory');
                          setActiveView('delivery_orders');
                          addNotification('success', `Delivery Order ${d.delivery_id} dibuat.`);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-[#54745B] hover:bg-[#435e49] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Create Delivery Order (F-08)</span>
                    </button>

                    <button
                      onClick={handleTestPriceModification}
                      className="px-3 py-1.5 bg-white border border-[#B94B4B] text-[#B94B4B] hover:bg-red-50 text-xs font-medium rounded-lg flex items-center gap-1"
                      title="Uji Penolakan Ubah Harga Confirmed (T-11)"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Uji Coba Ubah Harga (T-11)</span>
                    </button>
                  </>
                )}
              </div>
            }
          />

          {/* Form Content */}
          <div className="p-6 max-w-6xl mx-auto w-full">
            <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-8">
              {/* Smart Buttons */}
              <SmartButtons
                buttons={[
                  {
                    label: 'Delivery Orders',
                    count: currentOrder.delivery_ids.length,
                    icon: Truck,
                    onClick: () => {
                      setActiveApp('inventory');
                      setActiveView('delivery_orders');
                    },
                  },
                  {
                    label: 'Invoices',
                    count: currentOrder.invoice_ids.length,
                    icon: Receipt,
                    onClick: () => {
                      setActiveApp('invoicing');
                      setActiveView('invoices');
                    },
                  },
                  {
                    label: 'Stok Tereservasi',
                    count: `${currentOrder.lines.reduce((s, l) => s + l.quantity, 0)} pcs`,
                    icon: Layers,
                  },
                ]}
              />

              {/* Document Header */}
              <div className="flex items-start justify-between border-b border-[#E7E3DD] pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-sm font-bold text-[#C18B42] bg-[#C18B42]/10 px-2.5 py-0.5 rounded">
                      {currentOrder.order_id}
                    </span>
                    {currentOrder.is_locked && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8C8983] bg-[#F5F0E8] px-2 py-0.5 rounded">
                        <Lock className="w-3 h-3" /> Dokumen Terkunci (Locked)
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-[#171717]">
                    {currentOrder.type === 'sales_order' ? 'Sales Order' : 'Quotation Penjualan'}
                  </h2>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#8C8983]">Total Pesanan (Termasuk PPN 11%)</div>
                  <div className="text-2xl font-bold font-mono text-[#171717]">
                    Rp{currentOrder.total_amount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Document Meta Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs mb-8">
                <div>
                  <label className="text-[#8C8983] block mb-1">Pelanggan (Customer)</label>
                  <div className="font-bold text-sm text-[#171717]">{orderCustomer?.name || currentOrder.customer_id}</div>
                  <div className="text-[#8C8983] mt-0.5">Termin Default: {orderCustomer?.payment_terms} · Limit: Rp{orderCustomer?.credit_limit_idr.toLocaleString()}</div>
                </div>

                <div>
                  <label className="text-[#8C8983] block mb-1">Termin Pembayaran Pesanan</label>
                  <div className="font-mono font-semibold text-sm text-[#171717]">{currentOrder.payment_terms}</div>
                  <div className="text-[#8C8983] mt-0.5">Gudang Pengeluaran: {currentOrder.warehouse_id}</div>
                </div>

                <div>
                  <label className="text-[#8C8983] block mb-1">Tanggal Pesanan & Salesperson</label>
                  <div className="font-medium text-[#171717]">{currentOrder.order_date}</div>
                  <div className="text-[#8C8983] mt-0.5">Sales: {currentOrder.salesperson}</div>
                </div>
              </div>

              {/* Order Lines Table */}
              <div className="mb-8">
                <div className="border border-[#E7E3DD] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                      <tr>
                        <th className="py-2.5 px-4">SKU Varian</th>
                        <th className="py-2.5 px-4">Nama Produk</th>
                        <th className="py-2.5 px-3">Ukuran</th>
                        <th className="py-2.5 px-3">Warna</th>
                        <th className="py-2.5 px-3 text-right">Kuantitas</th>
                        <th className="py-2.5 px-4 text-right">Harga Satuan</th>
                        <th className="py-2.5 px-3 text-right">Diskon %</th>
                        <th className="py-2.5 px-4 text-right">PPN (11%)</th>
                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E3DD]">
                      {currentOrder.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{line.sku}</td>
                          <td className="py-3 px-4 font-medium text-[#171717]">{line.product_name}</td>
                          <td className="py-3 px-3">{line.size}</td>
                          <td className="py-3 px-3 text-[#8C8983]">{line.color}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold">{line.quantity}</td>
                          <td className="py-3 px-4 text-right font-mono">Rp{line.unit_price.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono font-semibold">
                            {line.discount_pct > 0 ? (
                              <span className="text-[#C18B42] font-bold">{line.discount_pct}%</span>
                            ) : (
                              '0%'
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[#8C8983]">
                            Rp{line.tax_amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">
                            Rp{line.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary */}
                <div className="flex justify-end mt-4">
                  <div className="w-72 space-y-2 text-xs font-mono p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD]">
                    <div className="flex justify-between">
                      <span className="text-[#8C8983]">Subtotal Sebelum Pajak:</span>
                      <span className="font-semibold text-[#171717]">
                        Rp{currentOrder.untaxed_amount.toLocaleString()}
                      </span>
                    </div>
                    {currentOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-[#C18B42]">
                        <span>Potongan Diskon:</span>
                        <span>-Rp{currentOrder.discount_amount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#8C8983]">PPN Efektif 11%:</span>
                      <span className="text-[#171717]">Rp{currentOrder.tax_amount.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-[#E7E3DD] flex justify-between font-bold text-sm text-[#171717]">
                      <span>Total Pesanan:</span>
                      <span className="text-base text-[#171717]">
                        Rp{currentOrder.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Chatter documentId={currentOrder.order_id} module="SALES" />
            </div>
          </div>

          {/* Credit Validation Modal */}
          {orderCustomer && (
            <CreditValidationModal
              isOpen={creditModalOpen}
              onClose={() => setCreditModalOpen(false)}
              customer={orderCustomer}
              grossNewOrder={currentOrder.total_amount}
              canOverride={currentUser?.role === 'owner'}
              onProceedAnyway={() => {
                setCreditModalOpen(false);
                confirmSalesOrder(currentOrder.order_id, true);
              }}
            />
          )}
        </>
      )}

      {/* Create New Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFEFC] rounded-2xl max-w-lg w-full border border-[#E7E3DD] shadow-2xl p-6 text-[#171717]">
            <h3 className="font-bold text-base mb-4">Buat Quotation Baru (F-05, F-06)</h3>
            <form onSubmit={handleCreateNewQuotation} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8C8983] mb-1">Pelanggan</label>
                <select
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD]"
                >
                  {customers.map((c) => (
                    <option key={c.contact_id} value={c.contact_id}>
                      {c.contact_id} - {c.name} ({c.payment_terms}, Limit: Rp{c.credit_limit_idr.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8C8983] mb-1">Termin Pembayaran</label>
                <select
                  value={newTerms}
                  onChange={(e) => setNewTerms(e.target.value as any)}
                  className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD]"
                >
                  <option value="NET14">NET14</option>
                  <option value="NET30">NET30</option>
                  <option value="TUNAI">TUNAI</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8C8983] mb-1">SKU Produk Varian</label>
                <select
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD] font-mono"
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} - {p.product_name} (Rp{p.sales_price_idr.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8C8983] mb-1">Kuantitas</label>
                  <input
                    type="number"
                    min="1"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#8C8983] mb-1">Diskon % (SR-08: &gt;10% perlu Manajer)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(Number(e.target.value))}
                    className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD] font-mono"
                  />
                </div>
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
                  Buat Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
