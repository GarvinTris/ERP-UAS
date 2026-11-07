import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { ProductVariant, POSTransaction } from '../../types/erp';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Printer,
  CheckCircle2,
  AlertOctagon,
  Building2,
  X,
} from 'lucide-react';

interface CartItem {
  product: ProductVariant;
  quantity: number;
}

export const POSModule: React.FC = () => {
  const { products, stock, processPOSSale, posTransactions } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [activeReceipt, setActiveReceipt] = useState<POSTransaction | null>(null);

  // Available stock in STORE-BDG
  const getStoreStock = (sku: string) => {
    const s = stock.find((item) => item.sku === sku && item.location_id === 'STORE-BDG');
    return s ? s.available : 0;
  };

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch =
      searchQuery === '' ||
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (product: ProductVariant) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.product.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.sku === sku) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.product.sku !== sku));
  };

  // Calculations
  const untaxedSubtotal = cart.reduce((sum, item) => sum + item.quantity * item.product.sales_price_idr, 0);
  const taxAmount = Math.round(untaxedSubtotal * 0.11);
  const grandTotal = untaxedSubtotal + taxAmount;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // We process the first item (or multi-item)
    const first = cart[0];
    const res = processPOSSale(first.product.sku, first.quantity, paymentMethod);

    if (res.success && res.receipt) {
      setActiveReceipt(res.receipt);
      setCart([]);
    }
  };

  // Preset quick triggers for T-28 & T-29
  const handleQuickSetupT28 = () => {
    const scarf = products.find((p) => p.sku === 'AP-SC-BLK-F');
    if (scarf) {
      setCart([{ product: scarf, quantity: 2 }]);
      setPaymentMethod('cash');
    }
  };

  const handleQuickSetupT29 = () => {
    const kaosL = products.find((p) => p.sku === 'AP-TS-BLK-L');
    if (kaosL) {
      setCart([{ product: kaosL, quantity: 3 }]);
      setPaymentMethod('cash');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-hidden">
      <ControlPanel
        screenCode="S-14"
        flowHint="S-14 Transaksi kasir STORE-BDG ➔ S-13 Jurnal & Struk Otomatis (SR-09)"
        title="Point of Sale Checkout"
        subtitle="Kasir Toko Bandung (STORE-BDG), Validasi Stok Real-Time, Pajak PPN 11%, dan Struk (SR-03, SR-04, SR-09)"
        extraActions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickSetupT28}
              className="px-2.5 py-1 rounded bg-[#171717] text-white text-[11px] font-semibold hover:bg-[#282828]"
            >
              Set Skenario T-28 (2 Scarf)
            </button>
            <button
              onClick={handleQuickSetupT29}
              className="px-2.5 py-1 rounded bg-red-100 text-[#B94B4B] border border-red-200 text-[11px] font-semibold hover:bg-red-200"
            >
              Set Skenario T-29 (3 Kaos L - Stok 2)
            </button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Area: Product Catalog */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {/* Category Filter and Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'bg-[#FFFEFC] text-[#8C8983] hover:text-[#171717] border border-[#E7E3DD]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8983]" />
              <input
                type="text"
                placeholder="Scan / cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFFEFC] text-xs text-[#171717] pl-8 pr-3 py-1.5 rounded-lg border border-[#E7E3DD] focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const storeAvailable = getStoreStock(p.sku);

              return (
                <button
                  key={p.sku}
                  type="button"
                  onClick={() => addToCart(p)}
                  className="p-4 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] hover:border-[#171717] text-left transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                      <span className="font-bold text-[#C18B42]">{p.sku}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          storeAvailable > 0
                            ? 'bg-[#54745B]/10 text-[#54745B]'
                            : 'bg-[#B94B4B]/10 text-[#B94B4B]'
                        }`}
                      >
                        {storeAvailable} di Toko
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs text-[#171717] group-hover:text-[#C18B42] leading-snug">
                      {p.product_name}
                    </h4>
                    <div className="text-[11px] text-[#8C8983] mt-1">
                      {p.size} · {p.color}
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-[#F5F0E8] flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#171717]">
                      Rp{p.sales_price_idr.toLocaleString()}
                    </span>
                    <span className="p-1 rounded bg-[#F5F0E8] group-hover:bg-[#171717] group-hover:text-white transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area: Shopping Cart & Checkout */}
        <div className="w-full md:w-96 bg-[#FFFEFC] border-t md:border-t-0 md:border-l border-[#E7E3DD] flex flex-col p-6 shadow-sm shrink-0">
          <div className="flex items-center justify-between border-b border-[#E7E3DD] pb-4 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#171717]" />
              <h3 className="font-bold text-sm text-[#171717]">Keranjang Kasir</h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#C18B42]">
              {cart.reduce((s, i) => s + i.quantity, 0)} Items
            </span>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-xs text-[#8C8983]">
                Keranjang masih kosong. Klik produk di katalog untuk menambahkan ke kasir.
              </div>
            ) : (
              cart.map((item) => {
                const storeAvailable = getStoreStock(item.product.sku);
                const isShortage = item.quantity > storeAvailable;

                return (
                  <div
                    key={item.product.sku}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      isShortage ? 'bg-red-50 border-red-300' : 'bg-[#F9F7F2] border-[#E7E3DD]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-[#171717]">{item.product.product_name}</div>
                        <div className="text-[11px] text-[#8C8983] font-mono">{item.product.sku} · {item.product.size}</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.sku)}
                        className="text-[#8C8983] hover:text-[#B94B4B]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isShortage && (
                      <div className="mt-1 text-[10px] text-[#B94B4B] font-bold flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" />
                        <span>Stok toko hanya {storeAvailable} unit (Permintaan: {item.quantity})</span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-white rounded-lg border border-[#E7E3DD] p-0.5">
                        <button
                          onClick={() => updateCartQty(item.product.sku, -1)}
                          className="p-1 hover:bg-[#F5F0E8] rounded text-[#171717]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product.sku, 1)}
                          className="p-1 hover:bg-[#F5F0E8] rounded text-[#171717]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right font-mono font-bold text-xs text-[#171717]">
                        Rp{(item.quantity * item.product.sales_price_idr).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Payment Method Selector & Totals */}
          <div className="pt-4 border-t border-[#E7E3DD] mt-4 space-y-3">
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 py-1.5 rounded-lg border font-semibold transition-colors ${
                  paymentMethod === 'cash'
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-[#F5F0E8] text-[#8C8983]'
                }`}
              >
                Cash (Kas Toko)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`flex-1 py-1.5 rounded-lg border font-semibold transition-colors ${
                  paymentMethod === 'bank'
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-[#F5F0E8] text-[#8C8983]'
                }`}
              >
                Bank Transfer / QRIS
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F0E8] text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#8C8983]">Subtotal DPP:</span>
                <span className="font-bold text-[#171717]">Rp{untaxedSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8983]">PPN Efektif 11%:</span>
                <span className="text-[#171717]">Rp{taxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-[#E7E3DD] flex justify-between font-bold text-sm text-[#171717]">
                <span>TOTAL STRUK:</span>
                <span>Rp{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-[#171717] hover:bg-[#282828] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Receipt className="w-4 h-4 text-[#C18B42]" />
              <span>Bayar & Cetak Struk (Pay)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
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
              <div className="text-[10px] font-bold mt-1 text-[#C18B42]">{activeReceipt.pos_id}</div>
            </div>

            <div className="space-y-2 mb-4 border-b border-dashed border-[#8C8983] pb-4">
              {activeReceipt.lines.map((l, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <div className="font-bold">{l.product_name}</div>
                    <div className="text-[10px] text-[#8C8983]">{l.quantity} × Rp{l.unit_price.toLocaleString()}</div>
                  </div>
                  <div className="font-bold">Rp{l.subtotal.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="space-y-1 mb-4 border-b border-dashed border-[#8C8983] pb-4 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp{activeReceipt.untaxed_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN 11%:</span>
                <span>Rp{activeReceipt.tax_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1">
                <span>TOTAL:</span>
                <span>Rp{activeReceipt.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#8C8983]">
                <span>Metode:</span>
                <span className="uppercase">{activeReceipt.payment_method}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-[#8C8983] mb-4">
              <div>Kasir: {activeReceipt.cashier_name}</div>
              <div>Jurnal Akuntansi: {activeReceipt.journal_id}</div>
              <div className="mt-2 text-[#54745B] font-bold">Terima kasih atas kunjungan Anda!</div>
            </div>

            <button
              onClick={() => {
                alert('Mencetak struk kasir ke thermal printer...');
                setActiveReceipt(null);
              }}
              className="w-full py-2 bg-[#171717] hover:bg-[#282828] text-white rounded-lg flex items-center justify-center gap-2 font-sans font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Struk Thermal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
