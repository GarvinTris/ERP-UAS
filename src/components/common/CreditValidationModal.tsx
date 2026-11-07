import React from 'react';
import { X, ShieldAlert, CheckCircle, AlertOctagon, ArrowRight } from 'lucide-react';
import { Customer } from '../../types/erp';

interface CreditValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  grossNewOrder: number;
  onProceedAnyway?: () => void;
  canOverride?: boolean;
}

export const CreditValidationModal: React.FC<CreditValidationModalProps> = ({
  isOpen,
  onClose,
  customer,
  grossNewOrder,
  onProceedAnyway,
  canOverride = false,
}) => {
  if (!isOpen) return null;

  const isCashOnly = customer.payment_terms === 'TUNAI' && customer.credit_limit_idr === 0;
  const currentExposure = customer.open_receivable + grossNewOrder;
  const isOverLimit = isCashOnly || currentExposure > customer.credit_limit_idr;
  const excess = Math.max(0, currentExposure - customer.credit_limit_idr);
  const remaining = Math.max(0, customer.credit_limit_idr - currentExposure);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFFEFC] rounded-2xl max-w-lg w-full border border-[#E7E3DD] shadow-2xl overflow-hidden text-[#171717]">
        {/* Header */}
        <div
          className={`p-6 border-b flex items-center justify-between ${
            isOverLimit ? 'bg-[#B94B4B]/10 border-[#B94B4B]/20 text-[#B94B4B]' : 'bg-[#54745B]/10 border-[#54745B]/20 text-[#54745B]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isOverLimit ? <AlertOctagon className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <div>
              <div className="font-mono text-[10px] uppercase font-bold tracking-wider">Business Rule SR-10</div>
              <h3 className="font-bold text-base leading-tight">
                {isOverLimit ? 'Pemeriksaan Credit Limit Gagal' : 'Validasi Credit Limit Lolos'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#8C8983] hover:text-[#171717]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <div className="text-[#8C8983]">Pelanggan:</div>
            <div className="text-sm font-bold text-[#171717]">{customer.name} ({customer.contact_id})</div>
            <div className="text-[11px] text-[#8C8983]">
              Termin Pembayaran: <span className="font-semibold text-[#171717]">{customer.payment_terms}</span> · Kota: {customer.city}
            </div>
          </div>

          {/* Breakdown numbers */}
          <div className="p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD] space-y-2.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#8C8983]">Batas Kredit (Credit Limit):</span>
              <span className="font-bold text-[#171717]">Rp{customer.credit_limit_idr.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8C8983]">Piutang Terbuka (Open AR):</span>
              <span className="text-[#171717]">Rp{customer.open_receivable.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8C8983]">Nilai Bruto Pesanan Baru (+PPN):</span>
              <span className="text-[#171717]">Rp{grossNewOrder.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-[#E7E3DD] flex items-center justify-between font-bold text-sm">
              <span>Total Eksposur Kredit:</span>
              <span className={isOverLimit ? 'text-[#B94B4B]' : 'text-[#54745B]'}>
                Rp{currentExposure.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Explanation message */}
          {isCashOnly ? (
            <div className="p-3 rounded-lg bg-[#B94B4B]/10 border border-[#B94B4B]/20 text-[#B94B4B]">
              <strong>Aturan SR-10:</strong> Pelanggan <strong>TUNAI</strong> tanpa limit kredit tidak diizinkan melakukan transaksi pemesanan secara kredit/tempo.
            </div>
          ) : isOverLimit ? (
            <div className="p-3 rounded-lg bg-[#B94B4B]/10 border border-[#B94B4B]/20 text-[#B94B4B]">
              <strong>Aturan SR-10:</strong> Total eksposur kredit melebihi batas limit yang ditetapkan sebesar <strong>Rp{excess.toLocaleString()}</strong>. Konfirmasi pesanan kredit ditolak untuk melindungi arus kas perusahaan.
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#54745B]/10 border border-[#54745B]/20 text-[#54745B]">
              Total eksposur kredit aman dan berada di dalam batas limit. Sisa ruang kredit tersedia: <strong>Rp{remaining.toLocaleString()}</strong>.
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="p-4 bg-[#F5F0E8] border-t border-[#E7E3DD] flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#D5CEBF] bg-white hover:bg-[#EAE5DC] text-[#171717] font-medium"
          >
            Tutup
          </button>
          {canOverride && isOverLimit && onProceedAnyway && (
            <button
              onClick={onProceedAnyway}
              className="px-4 py-2 rounded-lg bg-[#C18B42] hover:bg-[#aa7732] text-white font-semibold flex items-center gap-1.5"
            >
              <span>Otorisasi Khusus Manajer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
