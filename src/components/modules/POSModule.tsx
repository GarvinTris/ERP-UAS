import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { AddCustomerModal } from '../common/AddCustomerModal';
import { ProductVariant, POSTransaction, Customer } from '../../types/erp';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Printer,
  AlertOctagon,
  X,
  User,
  UserPlus,
  Banknote,
  QrCode,
  Delete,
  CheckCircle2,
  Clock,
  Store,
  ArrowRight,
  LogOut,
  Shirt,
} from 'lucide-react';

interface CartItem {
  product: ProductVariant;
  quantity: number;
  unitPrice: number;
  discountPct: number;
}

type NumpadMode = 'qty' | 'discount' | 'price';
type POSViewTab = 'register' | 'orders' | 'session';

export const POSModule: React.FC = () => {
  const {
    products,
    stock,
    customers,
    posTransactions,
    currentUser,
    processPOSCart,
    setActiveApp,
    addNotification,
  } = useERP();

  const [posTab, setPosTab] = useState<POSViewTab>('register');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Cart & Selected Orderline state (Odoo POS style)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [numpadMode, setNumpadMode] = useState<NumpadMode>('qty');
  const [numpadBuffer, setNumpadBuffer] = useState<string>('');

  // Customer selection
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('Pelanggan Walk-In');
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  // Payment screen modal (Odoo POS split payment)
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');

  // Receipt modal
  const [activeReceipt, setActiveReceipt] = useState<POSTransaction | null>(null);

  // Orders search
  const [orderSearch, setOrderSearch] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const getStoreStock = (sku: string) => {
    const s = stock.find((item) => item.sku === sku && item.location_id === 'STORE-BDG');
    return s ? s.available : 0;
  };

  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      p.product_name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q) ||
      p.size.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  // Cart operations
  const addToCart = (product: ProductVariant) => {
    const avail = getStoreStock(product.sku);
    const existing = cart.find((item) => item.product.sku === product.sku);
    if (avail <= 0) {
      addNotification('warning', `Stok ${product.sku} di Toko Bandung (STORE-BDG) kosong.`);
      return;
    }
    if (existing && existing.quantity + 1 > avail) {
      addNotification('warning', `Maksimal stok tersedia di toko untuk ${product.sku} adalah ${avail} pcs.`);
    }

    setCart((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.product.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.sales_price_idr, discountPct: 0 }];
    });
    setSelectedSku(product.sku);
    setNumpadBuffer('');
  };

  const selectLine = (sku: string) => {
    setSelectedSku(sku);
    setNumpadBuffer('');
  };

  const updateCartItem = (sku: string, patch: Partial<Pick<CartItem, 'quantity' | 'unitPrice' | 'discountPct'>>) => {
    setCart((prev) =>
      prev.map((item) => (item.product.sku === sku ? { ...item, ...patch } : item))
    );
  };

  const updateCartQty = (sku: string, delta: number) => {
    setCart((prev) => {
      const next = prev
        .map((item) => {
          if (item.product.sku !== sku) return item;
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        })
        .filter(Boolean) as CartItem[];
      if (!next.some((i) => i.product.sku === selectedSku)) {
        setSelectedSku(next[0]?.product.sku || null);
      }
      return next;
    });
    setNumpadBuffer('');
  };

  const removeFromCart = (sku: string) => {
    setCart((prev) => {
      const next = prev.filter((item) => item.product.sku !== sku);
      if (selectedSku === sku) {
        setSelectedSku(next[0]?.product.sku || null);
      }
      return next;
    });
    setNumpadBuffer('');
  };

  const clearCart = () => {
    setCart([]);
    setSelectedSku(null);
    setNumpadBuffer('');
    setSelectedCustomerName('Pelanggan Walk-In');
  };

  // Odoo POS Numpad logic for selected orderline
  const handleNumpadKey = (key: string) => {
    if (!selectedSku) return;
    const selectedItem = cart.find((c) => c.product.sku === selectedSku);
    if (!selectedItem) return;

    let nextBuf = numpadBuffer;
    if (key === 'BACKSPACE') {
      nextBuf = nextBuf.slice(0, -1);
    } else if (key === 'CLEAR') {
      nextBuf = '';
    } else {
      nextBuf = nextBuf + key;
    }

    setNumpadBuffer(nextBuf);
    const numVal = nextBuf === '' ? 0 : Number(nextBuf);
    if (Number.isNaN(numVal)) return;

    if (numpadMode === 'qty') {
      if (nextBuf !== '') {
        updateCartItem(selectedSku, { quantity: Math.max(1, numVal) });
      }
    } else if (numpadMode === 'discount') {
      updateCartItem(selectedSku, { discountPct: Math.min(100, Math.max(0, numVal)) });
    } else if (numpadMode === 'price') {
      updateCartItem(selectedSku, { unitPrice: Math.max(0, numVal) });
    }
  };

  // Calculations
  const grossSubtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const untaxedSubtotal = cart.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unitPrice * (1 - item.discountPct / 100)),
    0
  );
  const totalDiscount = grossSubtotal - untaxedSubtotal;
  const taxAmount = Math.round(untaxedSubtotal * 0.11);
  const grandTotal = untaxedSubtotal + taxAmount;
  const hasStockShortage = cart.some((item) => item.quantity > getStoreStock(item.product.sku));

  const openPaymentScreen = () => {
    if (cart.length === 0) return;
    if (hasStockShortage) {
      addNotification('error', 'Periksa kuantitas item: ada produk melebihi stok tersedia di Toko Bandung.');
      return;
    }
    setPaymentMethod('cash');
    setCashTendered(String(grandTotal));
    setPaymentOpen(true);
  };

  const parsedCash = Number(cashTendered.replace(/\D/g, '')) || 0;
  const cashShortage = paymentMethod === 'cash' && parsedCash < grandTotal;
  const changeDue = paymentMethod === 'cash' ? Math.max(0, parsedCash - grandTotal) : 0;

  const handleValidatePayment = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && parsedCash < grandTotal) {
      addNotification('error', 'Uang diterima masih kurang dari total tagihan.');
      return;
    }

    const res = processPOSCart({
      items: cart.map((c) => ({
        sku: c.product.sku,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        discountPct: c.discountPct,
      })),
      paymentMethod,
      customerName: selectedCustomerName,
      amountPaid: paymentMethod === 'cash' ? parsedCash : grandTotal,
    });

    if (res.success && res.receipt) {
      setPaymentOpen(false);
      setActiveReceipt(res.receipt);
      clearCart();
    }
  };

  // Session summary metrics
  const sessionTotalRevenue = posTransactions.reduce((s, t) => s + t.total_amount, 0);
  const sessionCashTotal = posTransactions
    .filter((t) => t.payment_method === 'cash')
    .reduce((s, t) => s + t.total_amount, 0);
  const sessionBankTotal = posTransactions
    .filter((t) => t.payment_method === 'bank')
    .reduce((s, t) => s + t.total_amount, 0);

  const filteredOrders = posTransactions.filter((t) => {
    const q = orderSearch.toLowerCase();
    return (
      !q ||
      t.pos_id.toLowerCase().includes(q) ||
      t.customer_name.toLowerCase().includes(q) ||
      t.cashier_name.toLowerCase().includes(q)
    );
  });

  const selectedLineItem = cart.find((c) => c.product.sku === selectedSku);

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-hidden">
      {/* ===================================================================== */}
      {/* ODOO POS TOP REGISTER BAR                                             */}
      {/* ===================================================================== */}
      <div className="bg-[#FFFEFC] border-b border-[#E7E3DD] px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#171717] text-white flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-[#C18B42]" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#171717]">
              <span>POS Toko Bandung</span>
              <span className="text-xs font-mono font-semibold text-[#8C8983]">STORE-BDG</span>
            </div>
            <div className="text-[11px] text-[#8C8983]">
              Kasir: <span className="text-[#171717] font-medium">{currentUser?.name || 'Salsa Widianti'}</span>
              <span aria-hidden="true"> · </span>
              <span>PPN 11% Otomatis</span>
            </div>
          </div>
        </div>

        {/* Odoo POS Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-0.5 bg-[#F5F0E8] rounded-lg border border-[#E7E3DD]">
            <button
              type="button"
              onClick={() => setPosTab('register')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                posTab === 'register'
                  ? 'bg-white text-[#171717] font-semibold shadow-xs'
                  : 'text-[#8C8983] hover:text-[#171717]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Register Kasir</span>
            </button>

            <button
              type="button"
              onClick={() => setPosTab('orders')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                posTab === 'orders'
                  ? 'bg-white text-[#171717] font-semibold shadow-xs'
                  : 'text-[#8C8983] hover:text-[#171717]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Riwayat Order ({posTransactions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setPosTab('session')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                posTab === 'session'
                  ? 'bg-white text-[#171717] font-semibold shadow-xs'
                  : 'text-[#8C8983] hover:text-[#171717]'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Ringkasan Sesi</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: ODOO POS 2-PANE REGISTER (TICKET + NUMPAD | CATALOG GRID)     */}
      {/* ===================================================================== */}
      {posTab === 'register' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT PANE: ORDER TICKET + ODOO INTERACTIVE NUMPAD */}
          <div className="w-full lg:w-[420px] xl:w-[450px] bg-[#FFFEFC] border-b lg:border-b-0 lg:border-r border-[#E7E3DD] flex flex-col shrink-0 overflow-hidden">
            {/* Customer Selector Bar */}
            <div className="px-4 py-2.5 border-b border-[#E7E3DD] bg-[#F9F7F2] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setCustomerModalOpen(true)}
                className="flex-1 flex items-center gap-2 text-left px-3 py-1.5 bg-white border border-[#E7E3DD] hover:border-[#171717] rounded-lg transition-colors min-w-0"
              >
                <User className="w-3.5 h-3.5 text-[#C18B42] shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-[#8C8983] leading-none">Pelanggan</div>
                  <div className="text-xs font-semibold text-[#171717] truncate mt-0.5">
                    {selectedCustomerName}
                  </div>
                </div>
              </button>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="px-2.5 py-2 text-xs font-medium text-[#B91C1C] hover:bg-red-50 border border-[#E7E3DD] bg-white rounded-lg transition-colors whitespace-nowrap"
                  title="Kosongkan Keranjang"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Orderlines Ticket List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F5F0E8]">
              {cart.length === 0 ? (
                <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center px-6 py-8">
                  <ShoppingCart className="w-8 h-8 text-[#D5CEBF] mb-2" />
                  <div className="text-xs font-semibold text-[#171717]">Keranjang Kasir Kosong</div>
                  <p className="text-[11px] text-[#8C8983] mt-1 max-w-[240px]">
                    Klik produk di sebelah kanan untuk menambahkan ke struk penjualan.
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const storeAvail = getStoreStock(item.product.sku);
                  const isShortage = item.quantity > storeAvail;
                  const isSelected = selectedSku === item.product.sku;
                  const lineSub = Math.round(item.quantity * item.unitPrice * (1 - item.discountPct / 100));

                  return (
                    <div
                      key={item.product.sku}
                      onClick={() => selectLine(item.product.sku)}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#F5F0E8]'
                          : 'bg-[#FFFEFC] hover:bg-[#F9F7F2]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Orderline Mini Thumbnail */}
                        <div className="w-10 h-10 rounded-lg bg-[#F5F0E8] border border-[#E7E3DD] overflow-hidden shrink-0 flex items-center justify-center">
                          {item.product.imageUrl && !failedImages[item.product.sku] ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.product_name}
                              referrerPolicy="no-referrer"
                              onError={() =>
                                setFailedImages((prev) => ({ ...prev, [item.product.sku]: true }))
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Shirt className="w-4 h-4 text-[#8C8983]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#171717] truncate">
                                {item.product.product_name}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#8C8983] font-mono mt-0.5 truncate">
                              {item.product.sku} · {item.product.size} · {item.product.color}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono tabular-nums font-bold text-xs text-[#171717]">
                              Rp{lineSub.toLocaleString()}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(item.product.sku);
                              }}
                              className="text-[11px] text-[#8C8983] hover:text-[#B91C1C] inline-flex items-center gap-0.5 mt-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {isShortage && (
                        <div className="mt-1.5 text-[11px] text-[#B91C1C] font-semibold flex items-center gap-1">
                          <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                          <span>Stok toko hanya {storeAvail} pcs</span>
                        </div>
                      )}

                      {/* Quick Inline Controls for Selected/All Lines */}
                      <div
                        className="mt-2 flex items-center justify-between gap-2 text-[11px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1 bg-white border border-[#E7E3DD] rounded-md p-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.product.sku, -1)}
                            className="p-1 hover:bg-[#F5F0E8] rounded text-[#171717]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-[#171717]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.product.sku, 1)}
                            className="p-1 hover:bg-[#F5F0E8] rounded text-[#171717]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[#8C8983]">@</span>
                          <input
                            type="text"
                            aria-label={`Harga ${item.product.product_name}`}
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateCartItem(item.product.sku, {
                                unitPrice: Number(e.target.value.replace(/\D/g, '')) || 0,
                              })
                            }
                            className="w-24 px-2 py-0.5 text-right font-mono font-semibold bg-white border border-[#E7E3DD] rounded text-[#171717] focus:outline-none focus:border-[#171717]"
                          />
                          {item.discountPct > 0 && (
                            <span className="font-mono font-semibold text-[#C18B42]">
                              -{item.discountPct}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Totals Summary */}
            <div className="px-4 py-3 border-t border-[#E7E3DD] bg-[#F9F7F2] space-y-1 text-xs font-mono tabular-nums">
              <div className="flex justify-between text-[#8C8983]">
                <span>Subtotal DPP</span>
                <span className="text-[#171717] font-medium">Rp{untaxedSubtotal.toLocaleString()}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-[#C18B42]">
                  <span>Potongan Diskon</span>
                  <span>-Rp{totalDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#8C8983]">
                <span>PPN 11%</span>
                <span className="text-[#171717]">Rp{taxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-1.5 border-t border-[#E7E3DD] flex justify-between items-baseline font-sans">
                <span className="text-sm font-bold text-[#171717]">Total Tagihan</span>
                <span className="text-xl font-bold font-mono tabular-nums text-[#171717]">
                  Rp{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Odoo Signature Numpad + Payment CTA */}
            <div className="p-3 border-t border-[#E7E3DD] bg-[#FFFEFC] space-y-2.5">
              {/* Mode Switcher for Selected Line */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'qty' as NumpadMode, label: 'Qty' },
                  { key: 'discount' as NumpadMode, label: 'Disc %' },
                  { key: 'price' as NumpadMode, label: 'Harga' },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => {
                      setNumpadMode(m.key);
                      setNumpadBuffer('');
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      numpadMode === m.key
                        ? 'bg-[#171717] text-white border-[#171717]'
                        : 'bg-[#F5F0E8] text-[#525252] border-[#E7E3DD] hover:text-[#171717]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {selectedLineItem && (
                <div className="text-[11px] text-[#8C8983] flex items-center justify-between px-1">
                  <span className="truncate">
                    Aktif: <strong className="text-[#171717]">{selectedLineItem.product.product_name}</strong>
                  </span>
                  <span className="font-mono text-[#C18B42] font-semibold shrink-0">
                    {numpadMode === 'qty' && `Qty: ${selectedLineItem.quantity}`}
                    {numpadMode === 'discount' && `Disc: ${selectedLineItem.discountPct}%`}
                    {numpadMode === 'price' && `Rp${selectedLineItem.unitPrice.toLocaleString()}`}
                  </span>
                </div>
              )}

              {/* Tactile Keypad */}
              <div className="grid grid-cols-4 gap-1.5 text-sm font-mono font-semibold">
                {['1', '2', '3'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={!selectedLineItem}
                    onClick={() => handleNumpadKey(k)}
                    className="py-2 rounded-lg bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] disabled:opacity-40 transition-colors"
                  >
                    {k}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!selectedLineItem}
                  onClick={() => handleNumpadKey('CLEAR')}
                  className="py-2 rounded-lg bg-white hover:bg-[#F5F0E8] text-[#8C8983] border border-[#E7E3DD] text-xs font-sans font-semibold disabled:opacity-40 transition-colors"
                >
                  C
                </button>

                {['4', '5', '6'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={!selectedLineItem}
                    onClick={() => handleNumpadKey(k)}
                    className="py-2 rounded-lg bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] disabled:opacity-40 transition-colors"
                  >
                    {k}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!selectedLineItem}
                  onClick={() => handleNumpadKey('BACKSPACE')}
                  className="py-2 rounded-lg bg-white hover:bg-[#F5F0E8] text-[#171717] border border-[#E7E3DD] flex items-center justify-center disabled:opacity-40 transition-colors"
                  aria-label="Hapus digit"
                >
                  <Delete className="w-4 h-4" />
                </button>

                {['7', '8', '9'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={!selectedLineItem}
                    onClick={() => handleNumpadKey(k)}
                    className="py-2 rounded-lg bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] disabled:opacity-40 transition-colors"
                  >
                    {k}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!selectedLineItem}
                  onClick={() => handleNumpadKey('000')}
                  className="py-2 rounded-lg bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] text-xs disabled:opacity-40 transition-colors"
                >
                  000
                </button>

                <button
                  type="button"
                  disabled={!selectedLineItem}
                  onClick={() => handleNumpadKey('0')}
                  className="py-2 rounded-lg bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] disabled:opacity-40 transition-colors"
                >
                  0
                </button>

                {/* Primary Payment Trigger */}
                <button
                  type="button"
                  disabled={cart.length === 0 || hasStockShortage}
                  onClick={openPaymentScreen}
                  className="col-span-3 py-2.5 px-4 bg-[#54745B] hover:bg-[#435e49] text-white font-sans text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                >
                  <span>Pembayaran</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANE: ODOO POS PRODUCT CATALOG GRID */}
          <div className="flex-1 flex flex-col p-5 overflow-y-auto">
            {/* Search & Category Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#171717] text-white'
                        : 'bg-[#FFFEFC] text-[#525252] hover:text-[#171717] border border-[#E7E3DD]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8983]" />
                <input
                  type="text"
                  placeholder="Cari produk, SKU, warna, ukuran..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FFFEFC] text-xs text-[#171717] pl-8 pr-8 py-2 rounded-lg border border-[#E7E3DD] focus:outline-none focus:border-[#171717]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8983] hover:text-[#171717]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Product Tiles Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-[#FFFEFC] border border-[#E7E3DD] rounded-xl p-12 text-center">
                <p className="text-sm font-semibold text-[#171717]">Produk tidak ditemukan</p>
                <p className="text-xs text-[#8C8983] mt-1">Ubah kata kunci pencarian atau pilih kategori lain.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map((p) => {
                  const storeAvailable = getStoreStock(p.sku);
                  const inCartQty = cart.find((c) => c.product.sku === p.sku)?.quantity || 0;
                  const showImg = Boolean(p.imageUrl) && !failedImages[p.sku];

                  return (
                    <button
                      key={p.sku}
                      type="button"
                      onClick={() => addToCart(p)}
                      className={`rounded-xl bg-[#FFFEFC] border text-left transition-colors flex flex-col justify-between overflow-hidden group ${
                        inCartQty > 0
                          ? 'border-[#171717] bg-white'
                          : storeAvailable <= 0
                          ? 'border-[#E7E3DD] opacity-65'
                          : 'border-[#E7E3DD] hover:border-[#171717]'
                      }`}
                    >
                      {/* Product Photo Area (4:3 Studio Frame) */}
                      <div className="relative aspect-[4/3] w-full bg-[#F5F0E8] overflow-hidden border-b border-[#F5F0E8]">
                        {showImg ? (
                          <img
                            src={p.imageUrl}
                            alt={`${p.product_name} (${p.color}, ${p.size})`}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            onError={() =>
                              setFailedImages((prev) => ({ ...prev, [p.sku]: true }))
                            }
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F0E8] to-[#EAE5DC] text-[#8C8983]">
                            <Shirt className="w-8 h-8 mb-1 text-[#C18B42]" />
                            <span className="text-[11px] font-medium text-[#525252] px-2 text-center truncate max-w-full">
                              {p.category}
                            </span>
                          </div>
                        )}

                        {inCartQty > 0 && (
                          <span className="absolute top-2 right-2 font-mono tabular-nums text-[11px] font-bold bg-[#171717] text-white px-2 py-0.5 rounded shadow-xs">
                            {inCartQty}x
                          </span>
                        )}

                        {storeAvailable <= 0 && (
                          <span className="absolute bottom-2 left-2 text-[11px] font-semibold bg-[#171717]/80 text-white px-2 py-0.5 rounded">
                            Stok Habis
                          </span>
                        )}
                      </div>

                      {/* Clean Product Details */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between w-full">
                        <div>
                          <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                            <span className="font-semibold text-[#C18B42] truncate">{p.sku}</span>
                            <span
                              className={`font-semibold shrink-0 tabular-nums ${
                                storeAvailable > 0 ? 'text-[#54745B]' : 'text-[#B91C1C]'
                              }`}
                            >
                              {storeAvailable > 0 ? `${storeAvailable} pcs` : '0 pcs'}
                            </span>
                          </div>

                          <h4 className="font-semibold text-sm text-[#171717] group-hover:text-[#C18B42] leading-snug mt-1 line-clamp-1">
                            {p.product_name}
                          </h4>

                          <div className="text-[11px] text-[#8C8983] mt-0.5">
                            {p.category} · {p.size} · {p.color}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#F5F0E8] flex items-center justify-between gap-2">
                          <span className="font-mono tabular-nums font-bold text-sm text-[#171717]">
                            Rp{p.sales_price_idr.toLocaleString()}
                          </span>

                          <span
                            className={`p-1 rounded transition-colors ${
                              inCartQty > 0
                                ? 'bg-[#171717] text-white'
                                : 'bg-[#F5F0E8] text-[#171717] group-hover:bg-[#171717] group-hover:text-white'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: RIWAYAT ORDER POS (ORDERS LIST)                               */}
      {/* ===================================================================== */}
      {posTab === 'orders' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-5">
          <div className="bg-[#FFFEFC] border border-[#E7E3DD] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E3DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#171717]">Riwayat Transaksi Kasir (POS Orders)</h2>
                <p className="text-xs text-[#8C8983]">Klik Lihat Struk untuk meninjau rincian item atau mencetak ulang.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8983]" />
                <input
                  type="text"
                  placeholder="Cari no. struk atau pelanggan..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-[#F5F0E8] text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E7E3DD] focus:outline-none focus:border-[#171717]"
                />
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#8C8983]">
                Belum ada transaksi POS yang tercatat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                    <tr>
                      <th className="py-3 px-6">No. Struk</th>
                      <th className="py-3 px-6">Waktu</th>
                      <th className="py-3 px-6">Pelanggan</th>
                      <th className="py-3 px-6">Kasir</th>
                      <th className="py-3 px-6">Metode</th>
                      <th className="py-3 px-6 text-right">Total</th>
                      <th className="py-3 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3DD]">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.pos_id} className="hover:bg-[#F9F7F2] transition-colors">
                        <td className="py-3.5 px-6 font-mono font-bold text-[#C18B42]">{ord.pos_id}</td>
                        <td className="py-3.5 px-6 font-mono text-[#525252]">{ord.date}</td>
                        <td className="py-3.5 px-6 font-medium text-[#171717]">{ord.customer_name}</td>
                        <td className="py-3.5 px-6 text-[#525252]">{ord.cashier_name}</td>
                        <td className="py-3.5 px-6 font-medium text-[#171717]">
                          {ord.payment_method === 'cash' ? 'Tunai' : 'Transfer / QRIS'}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono tabular-nums font-bold text-[#171717]">
                          Rp{ord.total_amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveReceipt(ord)}
                            className="px-3 py-1 bg-[#F5F0E8] hover:bg-[#171717] text-[#171717] hover:text-white border border-[#E7E3DD] rounded-md text-[11px] font-semibold transition-colors"
                          >
                            Lihat Struk
                          </button>
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

      {/* ===================================================================== */}
      {/* VIEW 3: RINGKASAN SESI KASIR (ODOO POS SESSION CLOSING SUMMARY)       */}
      {/* ===================================================================== */}
      {posTab === 'session' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-[#FFFEFC] border border-[#E7E3DD] rounded-xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E3DD] pb-5">
              <div>
                <h2 className="text-xl font-bold text-[#171717]">Ringkasan Sesi Kasir</h2>
                <p className="text-xs text-[#8C8983] mt-0.5">
                  Toko Bandung (STORE-BDG) · Kasir Aktif: {currentUser?.name || 'Salsa Widianti'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveApp('dashboard')}
                className="px-4 py-2 bg-[#171717] hover:bg-[#282828] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5 text-[#C18B42]" />
                <span>Tutup Tampilan POS</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#E7E3DD] rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-[#E7E3DD]">
              <div className="p-5">
                <div className="text-xs text-[#8C8983]">Total Penjualan Sesi</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#171717] mt-1">
                  Rp{sessionTotalRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-[#8C8983] mt-1">{posTransactions.length} transaksi selesai</div>
              </div>
              <div className="p-5">
                <div className="text-xs text-[#8C8983]">Penerimaan Tunai (Kas Toko)</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#54745B] mt-1">
                  Rp{sessionCashTotal.toLocaleString()}
                </div>
                <div className="text-xs text-[#8C8983] mt-1">Masuk akun Kas (1000)</div>
              </div>
              <div className="p-5">
                <div className="text-xs text-[#8C8983]">Transfer Bank / QRIS</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#171717] mt-1">
                  Rp{sessionBankTotal.toLocaleString()}
                </div>
                <div className="text-xs text-[#8C8983] mt-1">Masuk akun Bank (1010)</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-[#8C8983]">
                Seluruh transaksi POS otomatis mengurangi stok STORE-BDG dan memposting jurnal seimbang ke Akuntansi.
              </p>
              <button
                type="button"
                onClick={() => setPosTab('register')}
                className="px-4 py-2 bg-[#F5F0E8] hover:bg-[#EAE5DC] border border-[#E7E3DD] text-[#171717] rounded-lg text-xs font-semibold whitespace-nowrap"
              >
                Kembali ke Kasir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ODOO POS PAYMENT SCREEN                                        */}
      {/* ===================================================================== */}
      {paymentOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFEFC] border border-[#E7E3DD] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171717]">Pembayaran Kasir</h2>
                <p className="text-xs text-[#8C8983]">
                  Pelanggan: {selectedCustomerName} · {cart.reduce((s, i) => s + i.quantity, 0)} item
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentOpen(false)}
                className="p-1.5 rounded-lg text-[#8C8983] hover:text-[#171717] hover:bg-[#F5F0E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#E7E3DD]">
              {/* Payment Methods (Left 2 cols) */}
              <div className="md:col-span-2 p-5 space-y-3 bg-[#F9F7F2]">
                <div className="text-xs font-semibold text-[#8C8983]">Pilih Metode Pembayaran</div>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                    paymentMethod === 'cash'
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-white text-[#171717] border-[#E7E3DD] hover:border-[#171717]'
                  }`}
                >
                  <Banknote className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-[#C18B42]' : 'text-[#54745B]'}`} />
                  <div>
                    <div className="text-xs font-bold">Tunai (Cash)</div>
                    <div className={`text-[11px] ${paymentMethod === 'cash' ? 'text-[#D5CEBF]' : 'text-[#8C8983]'}`}>
                      Hitung uang diterima & kembalian
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                    paymentMethod === 'bank'
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-white text-[#171717] border-[#E7E3DD] hover:border-[#171717]'
                  }`}
                >
                  <QrCode className={`w-5 h-5 ${paymentMethod === 'bank' ? 'text-[#C18B42]' : 'text-[#171717]'}`} />
                  <div>
                    <div className="text-xs font-bold">Transfer Bank / QRIS</div>
                    <div className={`text-[11px] ${paymentMethod === 'bank' ? 'text-[#D5CEBF]' : 'text-[#8C8983]'}`}>
                      Pembayaran non-tunai pas
                    </div>
                  </div>
                </button>
              </div>

              {/* Payment Calculation (Right 3 cols) */}
              <div className="md:col-span-3 p-6 space-y-5">
                <div className="text-center pb-4 border-b border-[#E7E3DD]">
                  <div className="text-xs text-[#8C8983]">Total Yang Harus Dibayar</div>
                  <div className="text-3xl font-bold font-mono tabular-nums text-[#171717] mt-1">
                    Rp{grandTotal.toLocaleString()}
                  </div>
                </div>

                {paymentMethod === 'cash' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                        Uang Diterima (Rp)
                      </label>
                      <input
                        type="text"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 text-lg font-mono tabular-nums font-bold bg-[#F5F0E8] border border-[#E7E3DD] rounded-xl text-[#171717] focus:outline-none focus:border-[#171717]"
                      />
                    </div>

                    {/* Quick Cash Denomination Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setCashTendered(String(grandTotal))}
                        className="py-1.5 px-2 bg-[#F5F0E8] hover:bg-[#EAE5DC] border border-[#E7E3DD] rounded-lg text-xs font-semibold text-[#171717]"
                      >
                        Uang Pas
                      </button>
                      {[100000, 200000, 300000, 500000, 1000000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashTendered(String(amt))}
                          className="py-1.5 px-2 bg-[#F5F0E8] hover:bg-[#EAE5DC] border border-[#E7E3DD] rounded-lg text-xs font-mono font-semibold text-[#171717]"
                        >
                          Rp{(amt / 1000).toLocaleString()}rb
                        </button>
                      ))}
                    </div>

                    {/* Change Display */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                        cashShortage
                          ? 'bg-red-50 border-red-200 text-[#B91C1C]'
                          : 'bg-[#F5F0E8] border-[#E7E3DD] text-[#171717]'
                      }`}
                    >
                      <span className="font-semibold">
                        {cashShortage ? 'Uang Masih Kurang' : 'Kembalian'}
                      </span>
                      <span className="font-mono tabular-nums text-base font-bold">
                        Rp{(cashShortage ? grandTotal - parsedCash : changeDue).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD] text-xs space-y-1.5">
                    <div className="font-semibold text-[#171717]">Pembayaran QRIS / Transfer Bank</div>
                    <p className="text-[#8C8983]">
                      Pastikan pembayaran sebesar <strong className="font-mono text-[#171717]">Rp{grandTotal.toLocaleString()}</strong> telah masuk sebelum memvalidasi struk.
                    </p>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentOpen(false)}
                    className="px-4 py-2.5 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717] hover:bg-[#F5F0E8]"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    disabled={cashShortage}
                    onClick={handleValidatePayment}
                    className="px-5 py-2.5 bg-[#54745B] hover:bg-[#435e49] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validasi & Terbitkan Struk</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: PICK OR ADD CUSTOMER IN POS                                    */}
      {/* ===================================================================== */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFEFC] border border-[#E7E3DD] rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171717]">Pilih Pelanggan POS</h2>
                <p className="text-xs text-[#8C8983]">Pilih pelanggan terdaftar atau gunakan Pelanggan Walk-In.</p>
              </div>
              <button
                type="button"
                onClick={() => setCustomerModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8C8983] hover:text-[#171717] hover:bg-[#F5F0E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto divide-y divide-[#F5F0E8]">
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomerName('Pelanggan Walk-In');
                  setCustomerModalOpen(false);
                }}
                className="w-full px-3 py-2.5 text-left hover:bg-[#F5F0E8] rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-[#171717]">Pelanggan Walk-In</div>
                  <div className="text-[11px] text-[#8C8983]">Pembeli umum toko retail</div>
                </div>
                {selectedCustomerName === 'Pelanggan Walk-In' && (
                  <CheckCircle2 className="w-4 h-4 text-[#54745B]" />
                )}
              </button>

              {customers.map((c) => (
                <button
                  key={c.contact_id}
                  type="button"
                  onClick={() => {
                    setSelectedCustomerName(c.name);
                    setCustomerModalOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left hover:bg-[#F5F0E8] rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-[#171717]">{c.name}</div>
                    <div className="text-[11px] text-[#8C8983]">
                      {c.contact_id} · {c.contact_type} · {c.city}
                    </div>
                  </div>
                  {selectedCustomerName === c.name && (
                    <CheckCircle2 className="w-4 h-4 text-[#54745B]" />
                  )}
                </button>
              ))}
            </div>

            <div className="px-6 py-3.5 border-t border-[#E7E3DD] bg-[#F9F7F2] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAddCustomerOpen(true)}
                className="text-xs font-semibold text-[#C18B42] hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tambah Pelanggan Baru</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomerModalOpen(false)}
                className="px-3.5 py-1.5 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: THERMAL RECEIPT PREVIEW                                        */}
      {/* ===================================================================== */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-[#171717] shadow-2xl relative font-mono text-xs border border-[#E7E3DD]">
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute right-4 top-4 text-[#8C8983] hover:text-[#171717]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-dashed border-[#8C8983] pb-4 mb-4">
              <h3 className="font-bold text-base tracking-wider uppercase font-sans">PT Rona Karsa Apparel</h3>
              <div className="text-[10px] text-[#8C8983]">Toko Bandung (STORE-BDG)</div>
              <div className="text-[10px] text-[#8C8983] mt-1">{activeReceipt.date}</div>
              <div className="text-[11px] font-bold mt-1 text-[#C18B42]">{activeReceipt.pos_id}</div>
              <div className="text-[10px] text-[#525252] mt-0.5 font-sans">
                Pelanggan: {activeReceipt.customer_name}
              </div>
            </div>

            <div className="space-y-2.5 mb-4 border-b border-dashed border-[#8C8983] pb-4 max-h-56 overflow-y-auto">
              {activeReceipt.lines.map((l, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <div>
                    <div className="font-bold">{l.product_name}</div>
                    <div className="text-[10px] text-[#8C8983]">
                      {l.quantity} × Rp{l.unit_price.toLocaleString()}
                      {l.discount_pct > 0 ? ` (-${l.discount_pct}%)` : ''}
                    </div>
                  </div>
                  <div className="font-bold tabular-nums shrink-0">Rp{l.subtotal.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="space-y-1 mb-4 border-b border-dashed border-[#8C8983] pb-4">
              <div className="flex justify-between">
                <span>Subtotal DPP:</span>
                <span className="tabular-nums">Rp{activeReceipt.untaxed_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN 11%:</span>
                <span className="tabular-nums">Rp{activeReceipt.tax_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed border-[#D5CEBF]">
                <span>TOTAL:</span>
                <span className="tabular-nums">Rp{activeReceipt.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#525252] pt-1">
                <span>Metode:</span>
                <span className="uppercase">{activeReceipt.payment_method === 'cash' ? 'TUNAI' : 'BANK / QRIS'}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#525252]">
                <span>Dibayar:</span>
                <span className="tabular-nums">Rp{activeReceipt.amount_paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-[#171717]">
                <span>Kembalian:</span>
                <span className="tabular-nums">Rp{activeReceipt.change.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-[#8C8983] mb-4">
              <div>Kasir: {activeReceipt.cashier_name}</div>
              <div>Jurnal Akuntansi: {activeReceipt.journal_id}</div>
              <div className="mt-2 text-[#54745B] font-bold font-sans">Terima kasih atas kunjungan Anda!</div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-sans">
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="py-2 bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] rounded-lg font-semibold"
              >
                Order Baru
              </button>
              <button
                type="button"
                onClick={() => {
                  addNotification('success', `Struk ${activeReceipt.pos_id} dikirim ke printer thermal.`);
                  setActiveReceipt(null);
                }}
                className="py-2 bg-[#171717] hover:bg-[#282828] text-white rounded-lg flex items-center justify-center gap-1.5 font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal directly inside POS */}
      <AddCustomerModal
        isOpen={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onCreated={(newCust: Customer) => {
          setSelectedCustomerName(newCust.name);
          setCustomerModalOpen(false);
        }}
      />
    </div>
  );
};
