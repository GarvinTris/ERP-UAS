import React, { useState } from 'react';
import { Send, MessageSquare, Clock, User, ShieldCheck } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface ChatterProps {
  documentId: string;
  module: string;
  notes?: string[];
  onAddNote?: (note: string) => void;
}

export const Chatter: React.FC<ChatterProps> = ({ documentId, module, notes = [], onAddNote }) => {
  const { currentUser, auditLogs, logAudit, addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'log' | 'notes'>('log');
  const [newNote, setNewNote] = useState('');

  const docLogs = auditLogs.filter(
    (l) => l.document_number === documentId || l.description.includes(documentId)
  );

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    if (onAddNote) {
      onAddNote(newNote.trim());
    }
    logAudit('LOG_NOTE', module, documentId, `Catatan internal ditambahkan: "${newNote.trim()}"`, 'SUCCESS');
    addNotification('info', 'Catatan internal berhasil disimpan ke Chatter.');
    setNewNote('');
  };

  return (
    <div className="border-t border-[#E7E3DD] bg-[#FFFEFC] p-6 mt-8 rounded-b-xl">
      {/* Chatter tabs */}
      <div className="flex items-center justify-between border-b border-[#E7E3DD] pb-3 mb-4">
        <div className="flex items-center gap-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${
              activeTab === 'log' ? 'border-[#171717] text-[#171717]' : 'border-transparent text-[#8C8983] hover:text-[#171717]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#54745B]" />
            <span>Audit Trail ({docLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${
              activeTab === 'notes' ? 'border-[#171717] text-[#171717]' : 'border-transparent text-[#8C8983] hover:text-[#171717]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Log Notes & Komentar ({notes.length})</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-[#8C8983]">Doc Ref: {documentId}</span>
      </div>

      {/* Input box for new note */}
      <form onSubmit={handlePostNote} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tulis log note atau aktivitas baru untuk dokumen ini..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 bg-[#F5F0E8] text-xs px-3.5 py-2 rounded-lg border border-[#E7E3DD] focus:outline-none focus:border-[#171717] transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#171717] hover:bg-[#282828] text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3 h-3" />
            <span>Kirim</span>
          </button>
        </div>
      </form>

      {/* Audit Log Timeline */}
      {activeTab === 'log' && (
        <div className="space-y-3">
          {docLogs.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8C8983]">
              Belum ada log modifikasi tambahan pada dokumen ini.
            </div>
          ) : (
            docLogs.map((log) => (
              <div key={log.log_id} className="p-3 rounded-lg bg-[#F5F0E8] border border-[#E7E3DD] text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-medium text-[#171717]">
                    <User className="w-3 h-3 text-[#8C8983]" />
                    <span>{log.user} ({log.role})</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[#8C8983]">
                    <Clock className="w-3 h-3" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
                <div className="text-[#242424] font-medium">{log.description}</div>
                {log.previous_value && log.new_value && (
                  <div className="text-[10px] text-[#8C8983] font-mono">
                    Perubahan: {log.previous_value} → {log.new_value}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Notes tab */}
      {activeTab === 'notes' && (
        <div className="space-y-2">
          {notes.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8C8983]">
              Belum ada catatan internal. Tulis catatan di atas untuk menambahkan.
            </div>
          ) : (
            notes.map((note, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#F5F0E8] border border-[#E7E3DD] text-xs text-[#242424]">
                <div className="font-semibold text-[11px] text-[#171717] mb-1">Catatan Internal #{idx + 1}</div>
                <div>{note}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
