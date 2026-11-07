import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { Chatter } from '../common/Chatter';
import { ProductVariant } from '../../types/erp';
import { Shirt, Plus, ArrowLeft, Tag, Layers, Building2, Check, AlertCircle } from 'lucide-react';

export const ProductsModule: React.FC = () => {
  const { products, stock, createProductVariant } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New variant form states
  const [newSku, setNewSku] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newSize, setNewSize] = useState('M');
  const [newColor, setNewColor] = useState('Hitam');
  const [newSalesPrice, setNewSalesPrice] = useState('150000');
  const [newCost, setNewCost] = useState('80000');
  const [newVendor, setNewVendor] = useState('V01');
  const [newCategory, setNewCategory] = useState('T-Shirt');

  const filteredProducts = products.filter(
    (p) =>
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProduct = products.find((p) => p.sku === selectedSku);

  const getProductStock = (sku: string, locId: 'WH-JKT' | 'STORE-BDG') => {
    const s = stock.find((item) => item.sku === sku && item.location_id === locId);
    return s ? s.on_hand : 0;
  };

  const getProductReserved = (sku: string, locId: 'WH-JKT' | 'STORE-BDG') => {
    const s = stock.find((item) => item.sku === sku && item.location_id === locId);
    return s ? s.reserved : 0;
  };

  const getProductAvailable = (sku: string, locId: 'WH-JKT' | 'STORE-BDG') => {
    const s = stock.find((item) => item.sku === sku && item.location_id === locId);
    return s ? s.available : 0;
  };

  const handleCreateVariant = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createProductVariant({
      sku: newSku.trim().toUpperCase(),
      product_name: newProductName.trim(),
      size: newSize,
      color: newColor,
      uom: 'pcs',
      sales_price_idr: Number(newSalesPrice) || 0,
      cost_idr: Number(newCost) || 0,
      default_vendor_id: newVendor,
      category: newCategory,
    });

    if (res.success) {
      setShowCreateModal(false);
      setNewSku('');
      setNewProductName('');
    }
  };

  // Product Form View
  if (selectedProduct) {
    const whStock = getProductStock(selectedProduct.sku, 'WH-JKT');
    const whReserved = getProductReserved(selectedProduct.sku, 'WH-JKT');
    const whAvailable = getProductAvailable(selectedProduct.sku, 'WH-JKT');

    const storeStock = getProductStock(selectedProduct.sku, 'STORE-BDG');
    const storeReserved = getProductReserved(selectedProduct.sku, 'STORE-BDG');
    const storeAvailable = getProductAvailable(selectedProduct.sku, 'STORE-BDG');

    return (
      <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
        <ControlPanel
          title={`Form Product: ${selectedProduct.product_name} (${selectedProduct.sku})`}
          subtitle="Detail Varian Produk, Atribut Ukuran & Warna, Harga dan Biaya Standar (S-03)"
          extraActions={
            <button
              onClick={() => setSelectedSku(null)}
              className="px-3 py-1.5 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717] hover:bg-[#EAE5DC] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Daftar Varian</span>
            </button>
          }
        />

        <div className="p-6 max-w-5xl mx-auto w-full">
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-8">
            <div className="flex items-start justify-between border-b border-[#E7E3DD] pb-6 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#C18B42] bg-[#C18B42]/10 px-2.5 py-1 rounded">
                  {selectedProduct.sku}
                </span>
                <h2 className="text-2xl font-bold text-[#171717] mt-2">{selectedProduct.product_name}</h2>
                <div className="text-xs text-[#8C8983] mt-0.5">
                  Ukuran: <span className="font-semibold text-[#171717]">{selectedProduct.size}</span> · Warna: <span className="font-semibold text-[#171717]">{selectedProduct.color}</span> · Kategori: {selectedProduct.category}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-[#8C8983]">Harga Jual Satuan (Belum PPN)</div>
                <div className="text-2xl font-bold font-mono text-[#171717]">
                  Rp{selectedProduct.sales_price_idr.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#8C8983] font-mono mt-0.5">
                  Standar Cost: Rp{selectedProduct.cost_idr.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Inventory by location table */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                Posisi Stok Persediaan Lintas Lokasi (SR-04, SR-11)
              </h3>
              <div className="border border-[#E7E3DD] rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                    <tr>
                      <th className="py-2.5 px-4">Lokasi Gudang / Toko</th>
                      <th className="py-2.5 px-4">Tipe Lokasi</th>
                      <th className="py-2.5 px-4 text-right">On Hand</th>
                      <th className="py-2.5 px-4 text-right">Reserved</th>
                      <th className="py-2.5 px-4 text-right">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3DD]">
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#171717]">WH-JKT (Gudang Pusat Jakarta)</td>
                      <td className="py-3 px-4 text-[#8C8983]">Internal Warehouse</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">{whStock}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#C18B42] font-semibold">{whReserved}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#54745B]">{whAvailable}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#171717]">STORE-BDG (Toko Bandung)</td>
                      <td className="py-3 px-4 text-[#8C8983]">Internal Retail Location</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">{storeStock}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#C18B42] font-semibold">{storeReserved}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#54745B]">{storeAvailable}</td>
                    </tr>
                    <tr className="bg-[#F9F7F2] font-bold">
                      <td className="py-3 px-4" colSpan={2}>Total Persediaan Perusahaan</td>
                      <td className="py-3 px-4 text-right font-mono">{whStock + storeStock} pcs</td>
                      <td className="py-3 px-4 text-right font-mono text-[#C18B42]">{whReserved + storeReserved} pcs</td>
                      <td className="py-3 px-4 text-right font-mono text-[#54745B]">{whAvailable + storeAvailable} pcs</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Chatter documentId={selectedProduct.sku} module="PRODUCTS" />
          </div>
        </div>
      </div>
    );
  }

  // List View with side-by-side comparison of AP-TS-BLK-M and AP-TS-BLK-L (T-05)
  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-03"
        flowHint="S-03 Master Produk & Varian Ukuran/Warna (15 SKU Unik SR-11)"
        title="Form Products / Variants"
        subtitle="Master 15 SKU Fashion Varian, Atribut Ukuran & Warna, dan Saldo Stok per Lokasi"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateNew={() => setShowCreateModal(true)}
        createButtonLabel="Tambah Varian Baru"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* T-05 Side-by-side spotlight banner: AP-TS-BLK-M vs AP-TS-BLK-L */}
        <div className="p-5 rounded-xl bg-[#171717] text-white border border-[#2E2E2E] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Shirt className="w-4 h-4 text-[#C18B42]" />
              <span className="font-bold text-sm">Pembuktian Pengujian T-05: Dua Varian Terpisah (SR-11)</span>
            </div>
            <span className="text-[11px] font-mono text-[#C18B42] bg-[#C18B42]/10 px-2 py-0.5 rounded border border-[#C18B42]/20">
              Setiap kombinasi ukuran-warna mempunyai SKU unik
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AP-TS-BLK-M Card */}
            <div className="p-4 rounded-lg bg-[#222222] border border-[#333333]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#C18B42]">AP-TS-BLK-M</span>
                <span className="text-[10px] text-[#A6A29A]">Kaos Essential Hitam</span>
              </div>
              <div className="text-sm font-semibold text-white">Ukuran: M · Warna: Hitam</div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                <div className="p-2 bg-[#171717] rounded">
                  <div className="text-[#8C8983] text-[10px]">WH-JKT</div>
                  <div className="font-mono font-bold text-white mt-0.5">{getProductStock('AP-TS-BLK-M', 'WH-JKT')} pcs</div>
                </div>
                <div className="p-2 bg-[#171717] rounded">
                  <div className="text-[#8C8983] text-[10px]">Reserved</div>
                  <div className="font-mono font-bold text-[#C18B42] mt-0.5">{getProductReserved('AP-TS-BLK-M', 'WH-JKT')} pcs</div>
                </div>
                <div className="p-2 bg-[#171717] rounded">
                  <div className="text-[#8C8983] text-[10px]">Available</div>
                  <div className="font-mono font-bold text-[#54745B] mt-0.5">{getProductAvailable('AP-TS-BLK-M', 'WH-JKT')} pcs</div>
                </div>
              </div>
            </div>

            {/* AP-TS-BLK-L Card */}
            <div className="p-4 rounded-lg bg-[#222222] border border-[#333333]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#C18B42]">AP-TS-BLK-L</span>
                <span className="text-[10px] text-[#A6A29A]">Kaos Essential Hitam</span>
              </div>
              <div className="text-sm font-semibold text-white">Ukuran: L · Warna: Hitam</div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                <div className="p-2 bg-[#171717] rounded">
                  <div className="text-[#8C8983] text-[10px]">WH-JKT</div>
                  <div className="font-mono font-bold text-white mt-0.5">{getProductStock('AP-TS-BLK-L', 'WH-JKT')} pcs</div>
                </div>
                <div className="p-2 bg-[#171717] rounded">
                  <div className="text-[#8C8983] text-[10px]">STORE-BDG</div>
                  <div className="font-mono font-bold text-white mt-0.5">{getProductStock('AP-TS-BLK-L', 'STORE-BDG')} pcs</div>
                </div>
                <div className="p-2 bg-[#171717] rounded">
                  <div className="text-[#8C8983] text-[10px]">Total Stok</div>
                  <div className="font-mono font-bold text-[#54745B] mt-0.5">
                    {getProductStock('AP-TS-BLK-L', 'WH-JKT') + getProductStock('AP-TS-BLK-L', 'STORE-BDG')} pcs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Master Products Table */}
        <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Shirt className="w-4 h-4 text-[#171717]" />
              <h3 className="font-bold text-sm text-[#171717]">Katalog Varian Produk Fashion (15 Baseline SKU)</h3>
            </div>
            <span className="text-xs text-[#8C8983] font-mono">{filteredProducts.length} Varian</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F0E8] text-[#8C8983] uppercase tracking-wider font-semibold border-b border-[#E7E3DD]">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Ukuran</th>
                  <th className="py-3 px-4">Warna</th>
                  <th className="py-3 px-4 text-right">Harga Jual</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4 text-right">WH-JKT</th>
                  <th className="py-3 px-4 text-right">STORE-BDG</th>
                  <th className="py-3 px-4 text-right">Total Stok</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DD]">
                {filteredProducts.map((p) => {
                  const wh = getProductStock(p.sku, 'WH-JKT');
                  const store = getProductStock(p.sku, 'STORE-BDG');
                  const total = wh + store;

                  return (
                    <tr
                      key={p.sku}
                      onClick={() => setSelectedSku(p.sku)}
                      className="hover:bg-[#F9F7F2] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{p.sku}</td>
                      <td className="py-3 px-4 font-medium text-[#171717] group-hover:text-[#C18B42]">
                        {p.product_name}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#171717]">{p.size}</td>
                      <td className="py-3 px-4 text-[#8C8983]">{p.color}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-[#171717]">
                        Rp{p.sales_price_idr.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#8C8983]">
                        Rp{p.cost_idr.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-[#171717]">{wh}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-[#171717]">{store}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#54745B]">{total}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-medium text-[#C18B42] hover:underline">
                          Detail ›
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Variant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFEFC] rounded-2xl max-w-lg w-full border border-[#E7E3DD] shadow-2xl overflow-hidden text-[#171717]">
            <div className="p-6 border-b border-[#E7E3DD] flex items-center justify-between bg-white">
              <h3 className="font-bold text-base text-[#171717]">Tambah Varian Produk Baru (SR-11)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#8C8983] hover:text-[#171717]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVariant} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[#171717] font-semibold mb-1">
                  SKU Unik (Contoh: AP-TS-BLK-M) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="AP-TS-BLK-XL"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD] font-mono focus:border-[#171717] focus:outline-none"
                />
                <span className="text-[10px] text-[#8C8983] mt-1 block">
                  *Sistem akan menolak jika SKU sudah ada (Uji T-06).
                </span>
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  placeholder="Kaos Essential Hitam XL"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD] focus:border-[#171717] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Ukuran (Size)</label>
                  <select
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD]"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="All Size">All Size</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Warna (Color)</label>
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Harga Jual (IDR)</label>
                  <input
                    type="number"
                    value={newSalesPrice}
                    onChange={(e) => setNewSalesPrice(e.target.value)}
                    className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Standar Cost (IDR)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD] font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7E3DD] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#D5CEBF] rounded-lg hover:bg-[#F5F0E8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#282828] font-medium"
                >
                  Simpan Varian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
