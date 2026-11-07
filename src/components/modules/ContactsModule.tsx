import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { Chatter } from '../common/Chatter';
import { Customer, Vendor } from '../../types/erp';
import { User, Phone, Mail, MapPin, CreditCard, Clock, Building, Plus, ArrowLeft } from 'lucide-react';

export const ContactsModule: React.FC = () => {
  const { customers, vendors, activeView, setActiveView } = useERP();

  const [activeTab, setActiveTab] = useState<'all' | 'customers' | 'vendors'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  // Filter contacts
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendor_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCustomer = customers.find((c) => c.contact_id === selectedCustomerId);
  const selectedVendor = vendors.find((v) => v.vendor_id === selectedVendorId);

  // Form View for Customer
  if (selectedCustomer) {
    return (
      <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
        <ControlPanel
          title={`Form Contact: ${selectedCustomer.name} (${selectedCustomer.contact_id})`}
          subtitle="Master Data Pelanggan, Batas Kredit & Termin Pembayaran (S-02)"
          extraActions={
            <button
              onClick={() => setSelectedCustomerId(null)}
              className="px-3 py-1.5 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717] hover:bg-[#EAE5DC] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Daftar</span>
            </button>
          }
        />

        <div className="p-6 max-w-5xl mx-auto w-full">
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-8">
            <div className="flex items-start justify-between border-b border-[#E7E3DD] pb-6 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#C18B42] bg-[#C18B42]/10 px-2.5 py-1 rounded">
                  {selectedCustomer.contact_id}
                </span>
                <h2 className="text-2xl font-bold text-[#171717] mt-2">{selectedCustomer.name}</h2>
                <div className="text-xs text-[#8C8983] mt-0.5">{selectedCustomer.contact_type} · {selectedCustomer.city}</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-[#8C8983]">Piutang Berjalan (Open AR)</div>
                <div className="text-xl font-bold font-mono text-[#171717]">
                  Rp{selectedCustomer.open_receivable.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Fields grid matching S-02 wireframe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="text-[#8C8983] block mb-1">Tipe Kontak</label>
                  <div className="font-semibold text-sm text-[#171717]">{selectedCustomer.contact_type}</div>
                </div>

                <div>
                  <label className="text-[#8C8983] block mb-1">Kota / Domisili</label>
                  <div className="font-semibold text-sm text-[#171717] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#8C8983]" />
                    <span>{selectedCustomer.city}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[#8C8983] block mb-1">Email Korespondensi</label>
                  <div className="font-semibold text-sm text-[#171717] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#8C8983]" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[#8C8983] block mb-1">Telepon / WhatsApp</label>
                  <div className="font-semibold text-sm text-[#171717] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#8C8983]" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-[#F5F0E8] p-5 rounded-xl border border-[#E7E3DD]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#171717] border-b border-[#E7E3DD] pb-2">
                  Ketentuan Finansial (SR-10)
                </div>

                <div>
                  <label className="text-[#8C8983] block mb-1">Batas Kredit (Credit Limit)</label>
                  <div className="font-mono text-base font-bold text-[#171717]">
                    Rp{selectedCustomer.credit_limit_idr.toLocaleString()}
                  </div>
                  {selectedCustomer.credit_limit_idr === 0 ? (
                    <span className="text-[11px] text-[#B94B4B] font-medium">
                      *Pelanggan TUNAI: Tidak menerima pesanan kredit (SR-10).
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#54745B] font-medium">
                      *Limit aktif untuk pemesanan tempo.
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[#8C8983] block mb-1">Termin Pembayaran (Payment Terms)</label>
                  <div className="font-mono font-semibold text-sm text-[#171717] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8C8983]" />
                    <span>{selectedCustomer.payment_terms}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[#8C8983] block mb-1">Sisa Ruang Kredit Tersedia</label>
                  <div className="font-mono font-bold text-sm text-[#54745B]">
                    Rp{Math.max(0, selectedCustomer.credit_limit_idr - selectedCustomer.open_receivable).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <Chatter documentId={selectedCustomer.contact_id} module="CONTACTS" />
          </div>
        </div>
      </div>
    );
  }

  // Form View for Vendor
  if (selectedVendor) {
    return (
      <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
        <ControlPanel
          title={`Form Pemasok: ${selectedVendor.name} (${selectedVendor.vendor_id})`}
          subtitle="Master Data Vendor & Termin Pembelian (S-02)"
          extraActions={
            <button
              onClick={() => setSelectedVendorId(null)}
              className="px-3 py-1.5 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717] hover:bg-[#EAE5DC] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Daftar</span>
            </button>
          }
        />

        <div className="p-6 max-w-5xl mx-auto w-full">
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-8">
            <div className="flex items-start justify-between border-b border-[#E7E3DD] pb-6 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#C18B42] bg-[#C18B42]/10 px-2.5 py-1 rounded">
                  {selectedVendor.vendor_id}
                </span>
                <h2 className="text-2xl font-bold text-[#171717] mt-2">{selectedVendor.name}</h2>
                <div className="text-xs text-[#8C8983] mt-0.5">{selectedVendor.category} · {selectedVendor.city}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="text-[#8C8983] block mb-1">Kategori Produk</label>
                  <div className="font-semibold text-sm text-[#171717]">{selectedVendor.category}</div>
                </div>
                <div>
                  <label className="text-[#8C8983] block mb-1">Kota</label>
                  <div className="font-semibold text-sm text-[#171717]">{selectedVendor.city}</div>
                </div>
              </div>

              <div className="space-y-4 bg-[#F5F0E8] p-5 rounded-xl border border-[#E7E3DD]">
                <div>
                  <label className="text-[#8C8983] block mb-1">Termin Pembayaran Pembelian</label>
                  <div className="font-mono font-semibold text-sm text-[#171717]">{selectedVendor.payment_terms}</div>
                </div>
                <div>
                  <label className="text-[#8C8983] block mb-1">Email Order</label>
                  <div className="text-[#171717]">{selectedVendor.email}</div>
                </div>
              </div>
            </div>

            <Chatter documentId={selectedVendor.vendor_id} module="VENDORS" />
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-02"
        flowHint="S-02 Master Kontak Pelanggan B2B/Ritel & Pemasok (C01..C06, V01..V04)"
        title="Form Contacts"
        subtitle="Master Pelanggan & Pemasok, Batas Kredit (SR-10), dan Termin Pembayaran"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        extraActions={
          <div className="flex items-center gap-1 bg-[#F5F0E8] p-1 rounded-lg border border-[#E7E3DD] text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'all' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983] hover:text-[#171717]'
              }`}
            >
              Semua Kontak ({customers.length + vendors.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'customers' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983] hover:text-[#171717]'
              }`}
            >
              Pelanggan ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'vendors' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983] hover:text-[#171717]'
              }`}
            >
              Pemasok ({vendors.length})
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Customer Table */}
        {(activeTab === 'all' || activeTab === 'customers') && (
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#C18B42]" />
                <h3 className="font-bold text-sm text-[#171717]">Daftar Pelanggan (Customers)</h3>
              </div>
              <span className="text-xs text-[#8C8983] font-mono">{filteredCustomers.length} Pelanggan</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F0E8] text-[#8C8983] uppercase tracking-wider font-semibold border-b border-[#E7E3DD]">
                  <tr>
                    <th className="py-3 px-6">ID</th>
                    <th className="py-3 px-6">Nama Pelanggan</th>
                    <th className="py-3 px-6">Tipe</th>
                    <th className="py-3 px-6">Kota</th>
                    <th className="py-3 px-6 text-right">Credit Limit</th>
                    <th className="py-3 px-6">Termin</th>
                    <th className="py-3 px-6 text-right">Open AR</th>
                    <th className="py-3 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DD]">
                  {filteredCustomers.map((c) => (
                    <tr
                      key={c.contact_id}
                      onClick={() => setSelectedCustomerId(c.contact_id)}
                      className="hover:bg-[#F9F7F2] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-6 font-mono font-bold text-[#C18B42]">{c.contact_id}</td>
                      <td className="py-3.5 px-6 font-medium text-[#171717] group-hover:text-[#C18B42]">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-6 text-[#8C8983]">{c.contact_type}</td>
                      <td className="py-3.5 px-6 text-[#171717]">{c.city}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-medium text-[#171717]">
                        Rp{c.credit_limit_idr.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6 font-mono font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            c.payment_terms === 'TUNAI'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {c.payment_terms}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono text-[#8C8983]">
                        Rp{c.open_receivable.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className="text-[11px] font-medium text-[#C18B42] hover:underline">
                          Lihat Form ›
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vendor Table */}
        {(activeTab === 'all' || activeTab === 'vendors') && (
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#54745B]" />
                <h3 className="font-bold text-sm text-[#171717]">Daftar Pemasok (Vendors)</h3>
              </div>
              <span className="text-xs text-[#8C8983] font-mono">{filteredVendors.length} Pemasok</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F0E8] text-[#8C8983] uppercase tracking-wider font-semibold border-b border-[#E7E3DD]">
                  <tr>
                    <th className="py-3 px-6">ID</th>
                    <th className="py-3 px-6">Nama Vendor</th>
                    <th className="py-3 px-6">Kota</th>
                    <th className="py-3 px-6">Kategori Produk</th>
                    <th className="py-3 px-6">Termin</th>
                    <th className="py-3 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DD]">
                  {filteredVendors.map((v) => (
                    <tr
                      key={v.vendor_id}
                      onClick={() => setSelectedVendorId(v.vendor_id)}
                      className="hover:bg-[#F9F7F2] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-6 font-mono font-bold text-[#54745B]">{v.vendor_id}</td>
                      <td className="py-3.5 px-6 font-medium text-[#171717] group-hover:text-[#54745B]">
                        {v.name}
                      </td>
                      <td className="py-3.5 px-6 text-[#171717]">{v.city}</td>
                      <td className="py-3.5 px-6 text-[#8C8983]">{v.category}</td>
                      <td className="py-3.5 px-6 font-mono font-semibold">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-800">
                          {v.payment_terms}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className="text-[11px] font-medium text-[#54745B] hover:underline">
                          Lihat Form ›
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
