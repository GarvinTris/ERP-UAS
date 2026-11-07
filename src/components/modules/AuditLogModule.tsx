import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { ShieldCheck, Search, Filter, AlertTriangle, Clock, User, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AuditLogModule: React.FC = () => {
  const { auditLogs } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResult, setFilterResult] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchFilter = filterResult === 'all' || log.result === filterResult;
    const matchSearch =
      searchQuery === '' ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.document_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        title="Audit Log & Activity Trail (F-20)"
        subtitle="Perekaman Waktu, Aktor, Aksi, dan Jejak Keamanan Sistem ERP (SR-15, SR-16)"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        extraActions={
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#8C8983]">Status Hasil:</span>
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="bg-white border border-[#E7E3DD] rounded-lg px-2.5 py-1 text-xs"
            >
              <option value="all">Semua Status ({auditLogs.length})</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="DENIED">DENIED</option>
              <option value="VALIDATION_FAILED">VALIDATION_FAILED</option>
            </select>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E7E3DD] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#54745B]" />
              <h3 className="font-bold text-sm text-[#171717]">Daftar Aktivitas Sistem & Pengujian Keamanan</h3>
            </div>
            <span className="text-xs text-[#8C8983] font-mono">{filteredLogs.length} Catatan Log</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F5F0E8] text-[#8C8983] uppercase tracking-wider font-semibold border-b border-[#E7E3DD]">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Aktor / User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Modul</th>
                  <th className="py-3 px-4">No. Dokumen</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4 text-center">Hasil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DD]">
                {filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-[#F9F7F2] transition-colors">
                    <td className="py-3 px-4 font-mono text-[#8C8983] whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 font-medium text-[#171717]">{log.user}</td>
                    <td className="py-3 px-4 capitalize text-[#8C8983]">{log.role}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#171717]">{log.action}</td>
                    <td className="py-3 px-4 font-semibold text-[#8C8983]">{log.module}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#C18B42]">{log.document_number}</td>
                    <td className="py-3 px-4 text-[#171717] max-w-xs">{log.description}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.result === 'SUCCESS'
                            ? 'bg-[#54745B]/10 text-[#54745B] border border-[#54745B]/20'
                            : log.result === 'DENIED' || log.result === 'BLOCKED'
                            ? 'bg-[#B94B4B]/10 text-[#B94B4B] border border-[#B94B4B]/20'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
