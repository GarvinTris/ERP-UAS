import React from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { INITIAL_USERS } from '../../data/seedData';
import { Building2, Users, Shield, Hash, Check, X } from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { currentUser } = useERP();

  const rbacMatrix = [
    { module: 'Dashboard', owner: true, sales: true, wh: true, fin: true, cashier: true, proc: true },
    { module: 'CRM Pipeline', owner: true, sales: true, wh: false, fin: false, cashier: false, proc: false },
    { module: 'Sales & Orders', owner: true, sales: true, wh: false, fin: false, cashier: false, proc: false },
    { module: 'Point of Sale (Retail)', owner: true, sales: true, wh: false, fin: false, cashier: true, proc: false },
    { module: 'Inventory & Stock', owner: true, sales: true, wh: true, fin: false, cashier: false, proc: true },
    { module: 'Purchase & RFQ', owner: true, sales: false, wh: false, fin: false, cashier: false, proc: true },
    { module: 'Customer Invoices', owner: true, sales: false, wh: false, fin: true, cashier: false, proc: false },
    { module: 'Vendor Bills', owner: true, sales: false, wh: false, fin: true, cashier: false, proc: false },
    { module: 'Accounting & Journals', owner: true, sales: false, wh: false, fin: true, cashier: false, proc: false },
    { module: 'Audit Log', owner: true, sales: false, wh: false, fin: true, cashier: false, proc: false },
  ];

  const sequences = [
    { name: 'Sales Order Sequence', prefix: 'S', example: 'S00007', padding: '5 digits' },
    { name: 'Delivery Order Sequence', prefix: 'WH/OUT/', example: 'WH/OUT/00007', padding: '5 digits' },
    { name: 'Purchase Order Sequence', prefix: 'PO', example: 'PO00007', padding: '5 digits' },
    { name: 'Receipt / QA Sequence', prefix: 'WH/IN/', example: 'WH/IN/00007', padding: '5 digits' },
    { name: 'Customer Invoice Sequence', prefix: 'INV/2026/', example: 'INV/2026/0007', padding: '4 digits' },
    { name: 'Vendor Bill Sequence', prefix: 'BILL/2026/', example: 'BILL/2026/0007', padding: '4 digits' },
    { name: 'Customer Return Sequence', prefix: 'RET/2026/', example: 'RET/2026/0007', padding: '4 digits' },
    { name: 'Credit Note Sequence', prefix: 'CN/2026/', example: 'CN/2026/0007', padding: '4 digits' },
    { name: 'Point of Sale Receipt', prefix: 'POS/2026/', example: 'POS/2026/0001', padding: '4 digits' },
    { name: 'Internal Transfer Sequence', prefix: 'TRANS/2026/', example: 'TRANS/2026/0001', padding: '4 digits' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        title="Settings & Configuration"
        subtitle="Profil Perusahaan, Matriks Peran & Hak Akses (RBAC SR-16), dan Penomoran Dokumen Otomatis"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Company Profile */}
        <div className="p-6 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] shadow-2xs">
          <div className="flex items-center gap-2 mb-4 border-b border-[#E7E3DD] pb-3">
            <Building2 className="w-5 h-5 text-[#C18B42]" />
            <h3 className="font-bold text-base text-[#171717]">Profil Perusahaan</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="text-[#8C8983] block mb-1">Nama Perusahaan</label>
              <div className="font-bold text-sm text-[#171717]">PT Rona Karsa Apparel</div>
              <div className="text-[#8C8983] mt-0.5">Casual Essentials · Est. 2021</div>
            </div>
            <div>
              <label className="text-[#8C8983] block mb-1">Lokasi Fasilitas Operasional</label>
              <div className="font-semibold text-[#171717]">Gudang Pusat Jakarta (WH-JKT)</div>
              <div className="text-[#171717]">Toko Retail Bandung (STORE-BDG)</div>
            </div>
            <div>
              <label className="text-[#8C8983] block mb-1">Mata Uang & Pajak Simulasi</label>
              <div className="font-mono font-bold text-[#171717]">Indonesian Rupiah (IDR/Rp)</div>
              <div className="font-mono text-[#54745B] mt-0.5">PPN Efektif 11% (12% × 11/12)</div>
            </div>
          </div>
        </div>

        {/* RBAC Matrix */}
        <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-[#E7E3DD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#171717]" />
              <div>
                <h3 className="font-bold text-base text-[#171717]">Matriks Hak Akses Peran (RBAC - SR-16)</h3>
                <p className="text-xs text-[#8C8983]">Pemberian izin minimal sesuai tanggung jawab fungsional</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                <tr>
                  <th className="py-3 px-6">Modul ERP</th>
                  <th className="py-3 px-4 text-center">Owner</th>
                  <th className="py-3 px-4 text-center">Sales</th>
                  <th className="py-3 px-4 text-center">Warehouse</th>
                  <th className="py-3 px-4 text-center">Finance</th>
                  <th className="py-3 px-4 text-center">Cashier</th>
                  <th className="py-3 px-4 text-center">Procurement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DD]">
                {rbacMatrix.map((r, i) => (
                  <tr key={i} className="hover:bg-[#F9F7F2]">
                    <td className="py-3 px-6 font-semibold text-[#171717]">{r.module}</td>
                    <td className="py-3 px-4 text-center">{r.owner ? <Check className="w-4 h-4 text-[#54745B] mx-auto" /> : <X className="w-4 h-4 text-[#8C8983] mx-auto" />}</td>
                    <td className="py-3 px-4 text-center">{r.sales ? <Check className="w-4 h-4 text-[#54745B] mx-auto" /> : <X className="w-4 h-4 text-[#8C8983] mx-auto" />}</td>
                    <td className="py-3 px-4 text-center">{r.wh ? <Check className="w-4 h-4 text-[#54745B] mx-auto" /> : <X className="w-4 h-4 text-[#8C8983] mx-auto" />}</td>
                    <td className="py-3 px-4 text-center">{r.fin ? <Check className="w-4 h-4 text-[#54745B] mx-auto" /> : <X className="w-4 h-4 text-[#8C8983] mx-auto" />}</td>
                    <td className="py-3 px-4 text-center">{r.cashier ? <Check className="w-4 h-4 text-[#54745B] mx-auto" /> : <X className="w-4 h-4 text-[#8C8983] mx-auto" />}</td>
                    <td className="py-3 px-4 text-center">{r.proc ? <Check className="w-4 h-4 text-[#54745B] mx-auto" /> : <X className="w-4 h-4 text-[#8C8983] mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Sequences */}
        <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-2xs p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-[#E7E3DD] pb-3">
            <Hash className="w-5 h-5 text-[#C18B42]" />
            <h3 className="font-bold text-base text-[#171717]">Penomoran Dokumen Otomatis & Unik (SR-15)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {sequences.map((s, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-[#F5F0E8] border border-[#E7E3DD]">
                <div className="font-semibold text-[#171717]">{s.name}</div>
                <div className="font-mono font-bold text-[#C18B42] mt-1">{s.example}</div>
                <div className="text-[10px] text-[#8C8983] mt-0.5">Prefix: {s.prefix} · {s.padding}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
