import React, { useState } from 'react';
import { X, UserPlus, Building2, User } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Customer } from '../../types/erp';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (customer: Customer) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { createCustomer } = useERP();

  const [name, setName] = useState('');
  const [contactType, setContactType] = useState<Customer['contact_type']>('Pelanggan B2B');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentTerms, setPaymentTerms] = useState<Customer['payment_terms']>('NET14');
  const [creditLimit, setCreditLimit] = useState<string>('1000000');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama pelanggan atau perusahaan wajib diisi.');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('Kota domisili pelanggan wajib diisi.');
      return;
    }

    const parsedLimit = paymentTerms === 'TUNAI' ? 0 : Math.max(0, Number(creditLimit.replace(/\D/g, '')) || 0);

    const created = createCustomer({
      name: name.trim(),
      contact_type: contactType,
      city: city.trim(),
      email: email.trim() || '-',
      phone: phone.trim() || '-',
      payment_terms: paymentTerms,
      credit_limit_idr: parsedLimit,
    });

    setName('');
    setCity('');
    setEmail('');
    setPhone('');
    setPaymentTerms('NET14');
    setCreditLimit('1000000');
    setErrorMsg('');

    onCreated?.(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFEFC] border border-[#E7E3DD] rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-4 h-4 text-[#C18B42]" />
            <div>
              <h2 className="text-base font-bold text-[#171717]">Tambah Pelanggan Baru</h2>
              <p className="text-xs text-[#8C8983]">Data pelanggan langsung tersimpan ke CRM, Kontak, dan Penjualan.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C8983] hover:text-[#171717] hover:bg-[#F5F0E8] transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Tipe Pelanggan */}
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">Tipe Pelanggan</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F0E8] rounded-lg border border-[#E7E3DD]">
              <button
                type="button"
                onClick={() => {
                  setContactType('Pelanggan B2B');
                  if (paymentTerms === 'TUNAI') {
                    setPaymentTerms('NET14');
                    setCreditLimit('1000000');
                  }
                }}
                className={`py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                  contactType === 'Pelanggan B2B'
                    ? 'bg-white text-[#171717] shadow-xs font-semibold'
                    : 'text-[#8C8983] hover:text-[#171717]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Pelanggan B2B</span>
              </button>
              <button
                type="button"
                onClick={() => setContactType('Pelanggan ritel')}
                className={`py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                  contactType === 'Pelanggan ritel'
                    ? 'bg-white text-[#171717] shadow-xs font-semibold'
                    : 'text-[#8C8983] hover:text-[#171717]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Pelanggan Ritel</span>
              </button>
            </div>
          </div>

          {/* Nama & Kota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Nama Pelanggan <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: PT Gaya Nusantara"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Kota / Domisili <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Bandung"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          {/* Email & Telepon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Email</label>
              <input
                type="email"
                placeholder="email@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Telepon / WhatsApp</label>
              <input
                type="text"
                placeholder="0812-3456-7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          {/* Termin & Limit Kredit */}
          <div className="pt-2 border-t border-[#E7E3DD] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Termin Pembayaran</label>
              <select
                value={paymentTerms}
                onChange={(e) => {
                  const term = e.target.value as Customer['payment_terms'];
                  setPaymentTerms(term);
                  if (term === 'TUNAI') {
                    setCreditLimit('0');
                  } else if (creditLimit === '0') {
                    setCreditLimit('1000000');
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
              >
                <option value="TUNAI">TUNAI (Bayar Langsung)</option>
                <option value="NET14">NET14 (Tempo 14 Hari)</option>
                <option value="NET30">NET30 (Tempo 30 Hari)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Batas Kredit (Rp)</label>
              <input
                type="text"
                disabled={paymentTerms === 'TUNAI'}
                value={paymentTerms === 'TUNAI' ? '0' : creditLimit}
                onChange={(e) => setCreditLimit(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717] disabled:opacity-50"
              />
              <p className="text-[11px] text-[#8C8983] mt-1">
                {paymentTerms === 'TUNAI'
                  ? 'Termin TUNAI otomatis tanpa limit kredit.'
                  : `Limit aktif: Rp${(Number(creditLimit) || 0).toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E7E3DD] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717] hover:bg-[#F5F0E8] transition-colors whitespace-nowrap"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#171717] hover:bg-[#282828] text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
            >
              Simpan Pelanggan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
