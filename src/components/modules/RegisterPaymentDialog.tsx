import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { CreditCard, Check, Banknote, Building, Clock, ArrowRight } from 'lucide-react';

export const RegisterPaymentDialog: React.FC = () => {
  const {
    customerInvoices,
    vendorBills,
    registerCustomerPayment,
    registerVendorPayment,
    payments,
    setActiveApp,
    setActiveView,
    addNotification,
  } = useERP();

  const [docType, setDocType] = useState<'customer_invoice' | 'vendor_bill'>('customer_invoice');
  const [selectedDocId, setSelectedDocId] = useState<string>(
    customerInvoices[0]?.invoice_id || 'INV/2026/0007'
  );
  const [paymentAmount, setPaymentAmount] = useState<number>(200000);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cash'>('bank');

  const activeInvoice = customerInvoices.find((i) => i.invoice_id === selectedDocId);
  const activeBill = vendorBills.find((b) => b.bill_id === selectedDocId);

  const activeDoc = docType === 'customer_invoice' ? activeInvoice : activeBill;
  const originalAmount = activeDoc ? activeDoc.total_amount : 0;
  const residualAmount = activeDoc ? activeDoc.residual : 0;

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc) {
      addNotification('error', 'Dokumen tagihan tidak ditemukan!');
      return;
    }

    if (docType === 'customer_invoice' && activeInvoice) {
      const res = registerCustomerPayment(activeInvoice.invoice_id, paymentAmount, paymentMethod);
      if (res.success) {
        setPaymentAmount(Math.max(0, residualAmount - paymentAmount));
      }
    } else if (docType === 'vendor_bill' && activeBill) {
      const res = registerVendorPayment(activeBill.bill_id, paymentAmount, paymentMethod);
      if (res.success) {
        setPaymentAmount(Math.max(0, residualAmount - paymentAmount));
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-12"
        flowHint="S-12 Bayar vendor / terima piutang ➔ S-13 Journal Entries (SR-13)"
        title="Register Payment Dialog"
        subtitle="Pencatatan Pembayaran Parsial dan Pelunasan Piutang / Utang (SR-13, F-15)"
      />

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Payment Form Card */}
        <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-[#E7E3DD] pb-4">
            <CreditCard className="w-5 h-5 text-[#C18B42]" />
            <h2 className="text-xl font-bold text-[#171717]">Form Registrasi Pembayaran (S-12)</h2>
          </div>

          <form onSubmit={handleProcessPayment} className="space-y-6 text-xs">
            {/* Document Type Selector */}
            <div className="flex items-center gap-4">
              <label className="text-[#8C8983] font-semibold">Tipe Transaksi:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDocType('customer_invoice');
                    setSelectedDocId(customerInvoices[0]?.invoice_id || '');
                    setPaymentAmount(customerInvoices[0]?.residual || 200000);
                  }}
                  className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                    docType === 'customer_invoice'
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-white text-[#171717] border-[#E7E3DD]'
                  }`}
                >
                  Penerimaan Piutang Pelanggan (Customer Invoice)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDocType('vendor_bill');
                    setSelectedDocId(vendorBills[0]?.bill_id || '');
                    setPaymentAmount(vendorBills[0]?.residual || 632700);
                  }}
                  className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                    docType === 'vendor_bill'
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-white text-[#171717] border-[#E7E3DD]'
                  }`}
                >
                  Pembayaran Utang Pemasok (Vendor Bill)
                </button>
              </div>
            </div>

            {/* Document Reference Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#171717] font-semibold mb-1">
                  Nomor Referensi Dokumen Tagihan *
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => {
                    setSelectedDocId(e.target.value);
                    const doc =
                      docType === 'customer_invoice'
                        ? customerInvoices.find((i) => i.invoice_id === e.target.value)
                        : vendorBills.find((b) => b.bill_id === e.target.value);
                    if (doc) setPaymentAmount(doc.residual);
                  }}
                  className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD] font-mono font-bold"
                >
                  {docType === 'customer_invoice'
                    ? customerInvoices.map((inv) => (
                        <option key={inv.invoice_id} value={inv.invoice_id}>
                          {inv.invoice_id} - Sisa Rp{inv.residual.toLocaleString()} ({inv.status})
                        </option>
                      ))
                    : vendorBills.map((b) => (
                        <option key={b.bill_id} value={b.bill_id}>
                          {b.bill_id} - Sisa Rp{b.residual.toLocaleString()} ({b.status})
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Metode Pembayaran (Jurnal)</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#F5F0E8] p-2.5 rounded-lg border border-[#E7E3DD] font-semibold"
                >
                  <option value="bank">1010 Bank (Rekening Bank Mandiri)</option>
                  <option value="cash">1000 Kas (Kas Operasional)</option>
                </select>
              </div>
            </div>

            {/* Amount details */}
            <div className="p-5 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD] grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div>
                <span className="text-[#8C8983] block text-[11px]">Nilai Total Asli (Original)</span>
                <span className="text-base font-bold text-[#171717]">Rp{originalAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#8C8983] block text-[11px]">Sisa Belum Lunas (Residual)</span>
                <span className="text-base font-bold text-[#B94B4B]">Rp{residualAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#8C8983] block text-[11px]">Status Dokumen Saat Ini</span>
                <span className="text-base font-bold uppercase tracking-wider text-[#C18B42]">
                  {activeDoc?.status || 'N/A'}
                </span>
              </div>
            </div>

            {/* Input Amount to Pay */}
            <div>
              <label className="block text-[#171717] font-semibold mb-1">
                Jumlah Uang yang Dibayarkan (IDR) *
              </label>
              <input
                type="number"
                min="1"
                max={residualAmount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full bg-white p-3 rounded-lg border border-[#E7E3DD] font-mono text-base font-bold focus:border-[#171717] focus:outline-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPaymentAmount(200000)}
                  className="px-2.5 py-1 rounded bg-[#EAE5DC] text-[#171717] text-[11px] font-mono"
                >
                  Set Rp200.000 (Uji T-24 Parsial)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentAmount(133000)}
                  className="px-2.5 py-1 rounded bg-[#EAE5DC] text-[#171717] text-[11px] font-mono"
                >
                  Set Rp133.000 (Uji T-25 Sisa)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentAmount(residualAmount)}
                  className="px-2.5 py-1 rounded bg-[#EAE5DC] text-[#171717] text-[11px] font-mono"
                >
                  Lunasi Penuh (Rp{residualAmount.toLocaleString()})
                </button>
              </div>
            </div>

            {/* Rule Notice */}
            <div className="p-3 rounded-lg bg-[#54745B]/10 border border-[#54745B]/20 text-[11px] text-[#54745B]">
              <strong>Kaidah SR-13:</strong> Pembayaran parsial mengurangi saldo sebesar uang masuk/keluar; status <strong>Paid</strong> hanya diberikan jika saldo sisa tepat nol.
            </div>

            <button
              type="submit"
              disabled={residualAmount === 0}
              className="w-full py-3 bg-[#171717] hover:bg-[#282828] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Bukukan Pembayaran ke Jurnal & Saldo</span>
            </button>
          </form>
        </div>

        {/* Payment History Table matching wireframe */}
        <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E7E3DD] bg-white flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#171717]">Riwayat Registrasi Pembayaran</h3>
            <span className="text-xs text-[#8C8983] font-mono">{payments.length} Transaksi</span>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#8C8983]">
              Belum ada transaksi pembayaran tercatat. Gunakan form di atas untuk membukukan pembayaran.
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F5F0E8] text-[#8C8983] uppercase tracking-wider font-semibold border-b border-[#E7E3DD]">
                  <tr>
                    <th className="py-2.5 px-4">No. Bukti Bayar</th>
                    <th className="py-2.5 px-4">Tanggal</th>
                    <th className="py-2.5 px-4">Ref Dokumen</th>
                    <th className="py-2.5 px-4">Pihak Terkait</th>
                    <th className="py-2.5 px-4">Metode</th>
                    <th className="py-2.5 px-4 text-right">Jumlah Dibayar</th>
                    <th className="py-2.5 px-4 text-right">Sisa Residual</th>
                    <th className="py-2.5 px-4">Jurnal Entry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DD]">
                  {payments.map((p) => (
                    <tr key={p.payment_id}>
                      <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{p.payment_id}</td>
                      <td className="py-3 px-4 text-[#8C8983]">{p.date}</td>
                      <td className="py-3 px-4 font-mono font-bold">{p.doc_id}</td>
                      <td className="py-3 px-4">{p.party_name}</td>
                      <td className="py-3 px-4 font-semibold uppercase">{p.payment_method}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#54745B]">
                        Rp{p.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#8C8983]">
                        Rp{p.residual_after.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#C18B42]">
                        {p.journal_entry_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
