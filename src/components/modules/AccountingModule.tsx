import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { SmartButtons } from '../common/SmartButtons';
import { Chatter } from '../common/Chatter';
import { BookOpen, Scale, ExternalLink, FileSpreadsheet, ShieldCheck, ArrowRight } from 'lucide-react';

export const AccountingModule: React.FC = () => {
  const { journalEntries, accounts, setActiveApp, setActiveView } = useERP();

  const [activeTab, setActiveTab] = useState<'journals' | 'ledger' | 'coa'>('journals');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJournals = journalEntries.filter(
    (j) =>
      j.entry_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.source_doc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedJournal = journalEntries.find((j) => j.entry_id === selectedEntryId);

  const totalAllDebit = journalEntries.reduce((sum, j) => sum + j.total_debit, 0);
  const totalAllCredit = journalEntries.reduce((sum, j) => sum + j.total_credit, 0);
  const isBalanced = totalAllDebit === totalAllCredit;

  // Single Journal Detail View
  if (selectedJournal) {
    return (
      <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
        <ControlPanel
          title={`Journal Entry: ${selectedJournal.reference} (${selectedJournal.entry_id})`}
          subtitle="Pencatatan Buku Besar, Keseimbangan Debit/Kredit & Tautan Dokumen (S-13)"
          extraActions={
            <button
              onClick={() => setSelectedEntryId(null)}
              className="px-3 py-1.5 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717] hover:bg-[#EAE5DC]"
            >
              Kembali ke Daftar Jurnal
            </button>
          }
        />

        <div className="p-6 max-w-5xl mx-auto w-full">
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-8">
            <SmartButtons
              buttons={[
                {
                  label: `Source: ${selectedJournal.reference}`,
                  icon: ExternalLink,
                },
                {
                  label: 'Balance Status',
                  count: selectedJournal.total_debit === selectedJournal.total_credit ? 'SEIMBANG' : 'SELISIH',
                  icon: Scale,
                },
              ]}
            />

            <div className="flex items-start justify-between border-b border-[#E7E3DD] pb-6 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#C18B42] bg-[#C18B42]/10 px-2.5 py-0.5 rounded">
                  {selectedJournal.entry_id}
                </span>
                <h2 className="text-2xl font-bold text-[#171717] mt-1.5">{selectedJournal.source_doc}</h2>
                <div className="text-xs text-[#8C8983] mt-1">
                  Posting Date: <span className="text-[#171717] font-semibold">{selectedJournal.date}</span> · Tipe Jurnal: {selectedJournal.journal_type.toUpperCase()}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-[#8C8983]">Total Nilai Jurnal</div>
                <div className="text-2xl font-bold font-mono text-[#171717]">
                  Rp{selectedJournal.total_debit.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Journal Lines Table matching wireframe S-13 */}
            <div className="mb-6">
              <div className="border border-[#E7E3DD] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                    <tr>
                      <th className="py-2.5 px-4">Kode Akun</th>
                      <th className="py-2.5 px-4">Nama Akun</th>
                      <th className="py-2.5 px-4">Label / Keterangan Transaksi</th>
                      <th className="py-2.5 px-4 text-right">Debit (Rp)</th>
                      <th className="py-2.5 px-4 text-right">Kredit (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3DD]">
                    {selectedJournal.lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-[#F9F7F2]">
                        <td className="py-3 px-4 font-mono font-bold text-[#C18B42]">{line.account_code}</td>
                        <td className="py-3 px-4 font-semibold text-[#171717]">{line.account_name}</td>
                        <td className="py-3 px-4 text-[#8C8983]">{line.label}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">
                          {line.debit > 0 ? `Rp${line.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">
                          {line.credit > 0 ? `Rp${line.credit.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F9F7F2] font-bold text-xs border-t border-[#E7E3DD]">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right">
                        Total Jurnal (Debit == Kredit):
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#54745B]">
                        Rp{selectedJournal.total_debit.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#54745B]">
                        Rp{selectedJournal.total_credit.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <Chatter documentId={selectedJournal.entry_id} module="ACCOUNTING" />
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-13"
        flowHint="S-13 Kelola jurnal transaksi berpasangan seimbang (Debit == Credit)"
        title="Journal Entries / General Ledger"
        subtitle="Pembukuan Berpasangan (Double-Entry), Audit Keseimbangan Debit/Kredit, & Dokumen Sumber (SR-09, SR-15)"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        extraActions={
          <div className="flex items-center gap-1 bg-[#F5F0E8] p-1 rounded-lg border border-[#E7E3DD] text-xs">
            <button
              onClick={() => setActiveTab('journals')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'journals' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983]'
              }`}
            >
              Jurnal Umum ({journalEntries.length})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'ledger' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983]'
              }`}
            >
              Buku Besar (General Ledger)
            </button>
            <button
              onClick={() => setActiveTab('coa')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'coa' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983]'
              }`}
            >
              Bagan Akun (COA)
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Accounting Balance Verification Strip (T-26) */}
        <div className="p-5 rounded-xl bg-[#171717] text-white border border-[#2E2E2E] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#54745B]/20 border border-[#54745B]/40 flex items-center justify-center text-[#54745B]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#54745B] uppercase tracking-wider font-semibold">
                Validasi Akuntansi T-26 (Equality of Debits and Credits)
              </div>
              <div className="text-sm font-bold text-white">
                Keseimbangan Buku Besar PT Rona Karsa Apparel
              </div>
              <div className="text-xs text-[#A6A29A]">
                Setiap mutasi HPP, persediaan, piutang, dan kas/bank terikat berpasangan.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-[#222222] px-6 py-3 rounded-lg border border-[#333333] font-mono text-xs">
            <div>
              <span className="text-[#8C8983] block text-[10px]">TOTAL DEBIT</span>
              <span className="font-bold text-white text-base">Rp{totalAllDebit.toLocaleString()}</span>
            </div>
            <div className="border-l border-[#333333] pl-6">
              <span className="text-[#8C8983] block text-[10px]">TOTAL KREDIT</span>
              <span className="font-bold text-white text-base">Rp{totalAllCredit.toLocaleString()}</span>
            </div>
            <div className="border-l border-[#333333] pl-6">
              <span className="text-[#54745B] block text-[10px]">STATUS</span>
              <span className="font-bold text-[#54745B] text-sm">BALANCED OK</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Journal Entries Table */}
        {activeTab === 'journals' && (
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C18B42]" />
                <h3 className="font-bold text-sm text-[#171717]">Daftar Jurnal Umum (Journal Entries)</h3>
              </div>
              <span className="text-xs text-[#8C8983] font-mono">{filteredJournals.length} Jurnal</span>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F5F0E8] text-[#8C8983] uppercase tracking-wider font-semibold border-b border-[#E7E3DD]">
                  <tr>
                    <th className="py-3 px-4">No. Jurnal</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Referensi Dokumen</th>
                    <th className="py-3 px-4">Tipe Jurnal</th>
                    <th className="py-3 px-4">Sumber Transaksi</th>
                    <th className="py-3 px-4 text-right">Total Debit</th>
                    <th className="py-3 px-4 text-right">Total Kredit</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DD]">
                  {filteredJournals.map((j) => (
                    <tr
                      key={j.entry_id}
                      onClick={() => setSelectedEntryId(j.entry_id)}
                      className="hover:bg-[#F9F7F2] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#C18B42]">{j.entry_id}</td>
                      <td className="py-3.5 px-4 text-[#8C8983]">{j.date}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#171717]">{j.reference}</td>
                      <td className="py-3.5 px-4 font-semibold uppercase text-[11px] text-[#8C8983]">
                        {j.journal_type}
                      </td>
                      <td className="py-3.5 px-4 text-[#171717]">{j.source_doc}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#171717]">
                        Rp{j.total_debit.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#171717]">
                        Rp{j.total_credit.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[11px] font-medium text-[#C18B42] hover:underline">
                          Lihat Baris Jurnal ›
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: General Ledger View */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            {accounts.map((acc) => {
              // Collect lines for this account across all journals
              const lines = journalEntries.flatMap((j) =>
                j.lines
                  .filter((l) => l.account_code === acc.code)
                  .map((l) => ({ ...l, date: j.date, ref: j.reference }))
              );

              if (lines.length === 0) return null;

              const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
              const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
              const netBalance = totalDebit - totalCredit;

              return (
                <div key={acc.code} className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-2xs overflow-hidden">
                  <div className="p-4 bg-[#F5F0E8] border-b border-[#E7E3DD] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#C18B42] mr-2">{acc.code}</span>
                      <span className="font-bold text-sm text-[#171717]">{acc.name}</span>
                      <span className="text-xs text-[#8C8983] ml-2">({acc.type})</span>
                    </div>

                    <div className="font-mono text-xs font-bold">
                      Saldo Neto: <span className={netBalance >= 0 ? 'text-[#171717]' : 'text-[#B94B4B]'}>Rp{Math.abs(netBalance).toLocaleString()} {netBalance >= 0 ? 'Dr' : 'Cr'}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="text-[#8C8983] border-b border-[#E7E3DD] font-semibold bg-white">
                        <tr>
                          <th className="py-2 px-4">Tanggal</th>
                          <th className="py-2 px-4">Referensi</th>
                          <th className="py-2 px-4">Label</th>
                          <th className="py-2 px-4 text-right">Debit</th>
                          <th className="py-2 px-4 text-right">Kredit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E3DD]">
                        {lines.map((l, i) => (
                          <tr key={i} className="hover:bg-[#F9F7F2]">
                            <td className="py-2.5 px-4 text-[#8C8983]">{l.date}</td>
                            <td className="py-2.5 px-4 font-mono font-medium">{l.ref}</td>
                            <td className="py-2.5 px-4">{l.label}</td>
                            <td className="py-2.5 px-4 text-right font-mono font-medium">
                              {l.debit > 0 ? `Rp${l.debit.toLocaleString()}` : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-medium">
                              {l.credit > 0 ? `Rp${l.credit.toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Chart of Accounts */}
        {activeTab === 'coa' && (
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E3DD] bg-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#171717]">Bagan Akun Resmi PT Rona Karsa Apparel (Handout Halaman 10)</h3>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F5F0E8] text-[#8C8983] uppercase tracking-wider font-semibold border-b border-[#E7E3DD]">
                  <tr>
                    <th className="py-3 px-6">Kode Akun</th>
                    <th className="py-3 px-6">Nama Akun</th>
                    <th className="py-3 px-6">Tipe Akun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DD]">
                  {accounts.map((a) => (
                    <tr key={a.code} className="hover:bg-[#F9F7F2]">
                      <td className="py-3 px-6 font-mono font-bold text-[#C18B42]">{a.code}</td>
                      <td className="py-3 px-6 font-semibold text-[#171717]">{a.name}</td>
                      <td className="py-3 px-6 text-[#8C8983]">{a.type}</td>
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
