import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { Chatter } from '../common/Chatter';
import { AddCustomerModal } from '../common/AddCustomerModal';
import { CRMLead, Customer } from '../../types/erp';
import {
  Plus,
  ArrowRight,
  FileCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  UserPlus,
  Building2,
  Phone,
  Mail,
  ArrowLeft,
  LayoutGrid,
  List,
  Users,
  X,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import { SalesTrendChart, SalesByProductChart } from '../common/AnalyticsCharts';

type CRMViewMode = 'kanban' | 'list' | 'customers';

const STAGE_META: {
  key: CRMLead['stage'];
  step: string;
  label: string;
  helper: string;
  accentClass: string;
}[] = [
  {
    key: 'new',
    step: '01',
    label: 'Prospek Baru',
    helper: 'Kontak & permintaan masuk',
    accentClass: 'text-[#1D4ED8]',
  },
  {
    key: 'qualified',
    step: '02',
    label: 'Peluang Siap',
    helper: 'Kebutuhan jelas, siap ditawarkan',
    accentClass: 'text-[#B45309]',
  },
  {
    key: 'proposition',
    step: '03',
    label: 'Penawaran Dikirim',
    helper: 'Quotation sedang ditinjau',
    accentClass: 'text-[#6D28D9]',
  },
  {
    key: 'won',
    step: '04',
    label: 'Deal Menang',
    helper: 'Disetujui & siap diproses',
    accentClass: 'text-[#15803D]',
  },
  {
    key: 'lost',
    step: '05',
    label: 'Tidak Lanjut',
    helper: 'Dibatalkan / tidak cocok',
    accentClass: 'text-[#B91C1C]',
  },
];

const PRIORITY_LABEL: Record<CRMLead['priority'], { text: string; colorClass: string }> = {
  high: { text: 'Prioritas Tinggi', colorClass: 'text-[#B45309]' },
  medium: { text: 'Prioritas Sedang', colorClass: 'text-[#525252]' },
  low: { text: 'Prioritas Rendah', colorClass: 'text-[#8C8983]' },
};

export const CRMPipelineModule: React.FC = () => {
  const {
    leads,
    customers,
    salesOrders,
    createLead,
    updateLeadStage,
    updateLeadDetails,
    addLeadNote,
    convertLeadToOpportunity,
    convertOpportunityToQuotation,
    setActiveApp,
    setActiveView,
  } = useERP();

  const [viewMode, setViewMode] = useState<CRMViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Drag & Drop state for Kanban
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<CRMLead['stage'] | null>(null);

  // Modals state
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [editLeadOpen, setEditLeadOpen] = useState(false);

  // Add Lead Form state
  const [leadCustomerId, setLeadCustomerId] = useState<string>(customers[0]?.contact_id || '');
  const [leadTitle, setLeadTitle] = useState('');
  const [leadContactPerson, setLeadContactPerson] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadRevenue, setLeadRevenue] = useState('500000');
  const [leadPriority, setLeadPriority] = useState<CRMLead['priority']>('medium');
  const [leadInitialStage, setLeadInitialStage] = useState<'new' | 'qualified'>('new');
  const [leadNote, setLeadNote] = useState('');
  const [leadError, setLeadError] = useState('');

  // Edit Lead Form state
  const [editTitle, setEditTitle] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRevenue, setEditRevenue] = useState('0');
  const [editPriority, setEditPriority] = useState<CRMLead['priority']>('medium');
  const [editStage, setEditStage] = useState<CRMLead['stage']>('new');
  const [editError, setEditError] = useState('');

  const getPreviousStage = (
    stage: CRMLead['stage']
  ): { key: CRMLead['stage']; label: string } | null => {
    switch (stage) {
      case 'qualified':
        return { key: 'new', label: '01. Prospek Baru' };
      case 'proposition':
        return { key: 'qualified', label: '02. Peluang Siap' };
      case 'won':
        return { key: 'proposition', label: '03. Penawaran Dikirim' };
      case 'lost':
        return { key: 'new', label: '01. Prospek Baru' };
      default:
        return null;
    }
  };

  const openEditLeadModal = (lead: CRMLead) => {
    setEditTitle(lead.title);
    setEditContactPerson(lead.contact_person);
    setEditEmail(lead.email);
    setEditPhone(lead.phone);
    setEditRevenue(String(lead.expected_revenue));
    setEditPriority(lead.priority);
    setEditStage(lead.stage);
    setEditError('');
    setEditLeadOpen(true);
  };

  const handleEditLeadSubmit = (e: React.FormEvent, leadId: string) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditError('Judul prospek tidak boleh kosong.');
      return;
    }
    updateLeadDetails(leadId, {
      title: editTitle.trim(),
      contact_person: editContactPerson.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      expected_revenue: Number(editRevenue.replace(/\D/g, '')) || 0,
      priority: editPriority,
      stage: editStage,
    });
    setEditLeadOpen(false);
  };

  const getCustomer = (customerId: string): Customer | undefined =>
    customers.find((c) => c.contact_id === customerId);

  const openAddLeadModal = (preselectedCustomerId?: string) => {
    const targetCustomer =
      customers.find((c) => c.contact_id === preselectedCustomerId) || customers[0];
    setLeadCustomerId(targetCustomer?.contact_id || '');
    setLeadContactPerson(targetCustomer?.name || '');
    setLeadEmail(targetCustomer?.email || '');
    setLeadPhone(targetCustomer?.phone || '');
    setLeadTitle('');
    setLeadRevenue('500000');
    setLeadPriority('medium');
    setLeadInitialStage('new');
    setLeadNote('');
    setLeadError('');
    setAddLeadOpen(true);
  };

  const handleSelectLeadCustomer = (custId: string) => {
    setLeadCustomerId(custId);
    const cust = getCustomer(custId);
    if (cust) {
      setLeadContactPerson(cust.name);
      setLeadEmail(cust.email);
      setLeadPhone(cust.phone);
    }
  };

  const handleCustomerCreated = (newCust: Customer) => {
    if (addLeadOpen) {
      setLeadCustomerId(newCust.contact_id);
      setLeadContactPerson(newCust.name);
      setLeadEmail(newCust.email);
      setLeadPhone(newCust.phone);
    }
  };

  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError('');

    if (!leadCustomerId) {
      setLeadError('Silakan pilih atau tambah pelanggan terlebih dahulu.');
      return;
    }
    if (!leadTitle.trim()) {
      setLeadError('Judul kebutuhan / permintaan prospek wajib diisi.');
      return;
    }

    createLead({
      customer_id: leadCustomerId,
      title: leadTitle.trim(),
      contact_person: leadContactPerson.trim(),
      email: leadEmail.trim(),
      phone: leadPhone.trim(),
      expected_revenue: Number(leadRevenue.replace(/\D/g, '')) || 0,
      priority: leadPriority,
      stage: leadInitialStage,
      initial_note: leadNote.trim(),
    });

    setAddLeadOpen(false);
  };

  // Filtered datasets
  const filteredLeads = leads.filter((l) => {
    const cust = getCustomer(l.customer_id);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.lead_id.toLowerCase().includes(q) ||
      l.contact_person.toLowerCase().includes(q) ||
      (cust?.name.toLowerCase().includes(q) ?? false) ||
      (cust?.city.toLowerCase().includes(q) ?? false);
    const matchesStage = stageFilter === 'all' || l.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.contact_id.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  // Summary metrics
  const activeLeads = leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost');
  const activePipelineValue = activeLeads.reduce((sum, l) => sum + l.expected_revenue, 0);
  const wonLeads = leads.filter((l) => l.stage === 'won');
  const wonValue = wonLeads.reduce((sum, l) => sum + l.expected_revenue, 0);
  const waitingQuoteCount = leads.filter((l) => l.stage === 'qualified').length;
  const b2bCount = customers.filter((c) => c.contact_type === 'Pelanggan B2B').length;
  const retailCount = customers.filter((c) => c.contact_type === 'Pelanggan ritel').length;

  const selectedLead = leads.find((l) => l.lead_id === selectedLeadId);

  // ============================================================================
  // DETAIL VIEW FOR SELECTED LEAD
  // ============================================================================
  if (selectedLead) {
    const customer = getCustomer(selectedLead.customer_id);
    const stageInfo = STAGE_META.find((s) => s.key === selectedLead.stage) || STAGE_META[0];
    const priorityInfo = PRIORITY_LABEL[selectedLead.priority];
    const linkedQuotation = salesOrders.find((s) => s.order_id === selectedLead.converted_quotation_id);
    const progressStages = STAGE_META.filter((s) => s.key !== 'lost');
    const currentStepIndex = progressStages.findIndex((s) => s.key === selectedLead.stage);

    const prevStage = getPreviousStage(selectedLead.stage);

    return (
      <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
        <ControlPanel
          title={selectedLead.title}
          subtitle={`${selectedLead.lead_id} · ${customer?.name || selectedLead.contact_person}`}
          extraActions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditLeadModal(selectedLead)}
                className="px-3.5 py-1.5 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717] hover:bg-[#EAE5DC] flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Pencil className="w-3.5 h-3.5 text-[#C18B42]" />
                <span>Edit Prospek</span>
              </button>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="px-3.5 py-1.5 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717] hover:bg-[#EAE5DC] flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke CRM</span>
              </button>
            </div>
          }
        />

        <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
          {/* Main Detail Container */}
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] p-6 md:p-8">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-[#E7E3DD]">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#8C8983] mb-1.5">
                  <span className="font-mono font-semibold text-[#C18B42]">{selectedLead.lead_id}</span>
                  <span aria-hidden="true">·</span>
                  <span className={`font-semibold ${stageInfo.accentClass}`}>{stageInfo.label}</span>
                  <span aria-hidden="true">·</span>
                  <span className={priorityInfo.colorClass}>{priorityInfo.text}</span>
                </div>
                <h2 className="text-2xl font-bold text-[#171717]">{selectedLead.title}</h2>
                <p className="text-xs text-[#8C8983] mt-1">
                  Pelanggan: <span className="text-[#171717] font-semibold">{customer?.name || selectedLead.customer_id}</span>
                  {customer ? ` (${customer.contact_type} · ${customer.city})` : ''}
                </p>
              </div>

              <div className="md:text-right">
                <div className="text-xs text-[#8C8983]">Estimasi Nilai Penjualan</div>
                <div className="flex items-center md:justify-end gap-2 mt-0.5">
                  <div className="text-2xl font-bold font-mono tabular-nums text-[#171717]">
                    Rp{selectedLead.expected_revenue.toLocaleString()}
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditLeadModal(selectedLead)}
                    title="Ubah Estimasi Nilai"
                    className="p-1.5 bg-[#F5F0E8] hover:bg-[#EAE5DC] border border-[#E7E3DD] rounded-lg text-[#171717] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#C18B42]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Progress Bar (Clickable to Move Forward or Back) */}
            <div className="py-5 border-b border-[#E7E3DD]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="text-xs font-semibold text-[#171717]">Progres Tahapan Penjualan</div>
                <div className="text-[11px] text-[#8C8983]">
                  Klik tahap di bawah untuk memindahkan atau mengembalikan posisi prospek
                </div>
              </div>
              {selectedLead.stage === 'lost' ? (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-red-800 font-medium">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Prospek ini berstatus Tidak Lanjut / Dibatalkan.</span>
                  </div>
                  <button
                    onClick={() => updateLeadStage(selectedLead.lead_id, 'new')}
                    className="px-3 py-1.5 bg-white border border-red-200 rounded-md text-xs font-semibold text-[#171717] hover:bg-[#F5F0E8] whitespace-nowrap flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Aktifkan Kembali</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {progressStages.map((st, idx) => {
                    const isCompleted = currentStepIndex > idx;
                    const isCurrent = currentStepIndex === idx;
                    return (
                      <button
                        type="button"
                        key={st.key}
                        onClick={() => updateLeadStage(selectedLead.lead_id, st.key)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          isCurrent
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : isCompleted
                            ? 'bg-[#F5F0E8] text-[#171717] border-[#D5CEBF] hover:border-[#171717]'
                            : 'bg-white text-[#8C8983] border-[#E7E3DD] hover:border-[#171717] hover:text-[#171717]'
                        }`}
                      >
                        <div className="text-[11px] font-mono opacity-80">Tahap {st.step}</div>
                        <div className="text-xs font-bold mt-0.5">{st.label}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Guidance Strip */}
            <div className="py-5 border-b border-[#E7E3DD] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#171717]">Langkah Selanjutnya</div>
                <p className="text-xs text-[#8C8983] mt-0.5">
                  {selectedLead.stage === 'new' && 'Verifikasi kebutuhan pelanggan lalu proses prospek menjadi Peluang Siap.'}
                  {selectedLead.stage === 'qualified' && 'Buat dokumen Penawaran Harga (Quotation), atau kembalikan ke Prospek Baru jika masih perlu revisi.'}
                  {selectedLead.stage === 'proposition' && 'Pantau penawaran yang dikirim ke pelanggan, kembalikan ke Peluang, atau tandai Menang.'}
                  {selectedLead.stage === 'won' && 'Prospek telah berhasil menjadi deal penjualan. Anda tetap dapat mengembalikan tahap jika ada revisi.'}
                  {selectedLead.stage === 'lost' && 'Anda dapat mengaktifkan kembali prospek jika pelanggan tertarik lagi.'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {prevStage && (
                  <button
                    onClick={() => updateLeadStage(selectedLead.lead_id, prevStage.key)}
                    className="px-3.5 py-2 bg-white border border-[#E7E3DD] hover:bg-[#F5F0E8] text-[#171717] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#8C8983]" />
                    <span>Kembalikan ke {prevStage.label}</span>
                  </button>
                )}

                {selectedLead.stage === 'new' && (
                  <button
                    onClick={() => convertLeadToOpportunity(selectedLead.lead_id)}
                    className="px-4 py-2 bg-[#171717] hover:bg-[#282828] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#C18B42]" />
                    <span>Proses ke Peluang</span>
                  </button>
                )}

                {selectedLead.stage === 'qualified' && (
                  <button
                    onClick={() => {
                      if (selectedLead.converted_quotation_id) {
                        updateLeadStage(selectedLead.lead_id, 'proposition');
                      } else {
                        convertOpportunityToQuotation(selectedLead.lead_id);
                      }
                    }}
                    className="px-4 py-2 bg-[#171717] hover:bg-[#282828] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-[#54745B]" />
                    <span>
                      {selectedLead.converted_quotation_id
                        ? `Lanjut ke Penawaran (${selectedLead.converted_quotation_id})`
                        : 'Buat Penawaran Harga'}
                    </span>
                  </button>
                )}

                {selectedLead.stage === 'proposition' && (
                  <button
                    onClick={() => updateLeadStage(selectedLead.lead_id, 'won')}
                    className="px-4 py-2 bg-[#54745B] hover:bg-[#435e49] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Deal Menang</span>
                  </button>
                )}

                {selectedLead.converted_quotation_id && (
                  <button
                    onClick={() => {
                      setActiveApp('sales');
                      setActiveView('quotations');
                    }}
                    className="px-4 py-2 bg-white border border-[#C18B42] text-[#171717] hover:bg-[#F5F0E8] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#C18B42]" />
                    <span>Buka Penawaran {selectedLead.converted_quotation_id}</span>
                  </button>
                )}

                {selectedLead.stage !== 'won' && selectedLead.stage !== 'lost' && (
                  <button
                    onClick={() => updateLeadStage(selectedLead.lead_id, 'lost')}
                    className="px-3.5 py-2 bg-white border border-[#E7E3DD] text-[#B91C1C] hover:bg-red-50 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    Tandai Tidak Lanjut
                  </button>
                )}
              </div>
            </div>

            {/* Detail Information Grid */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">Informasi Kontak & PIC</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#8C8983] block mb-0.5">Kontak PIC</span>
                    <span className="font-semibold text-[#171717]">{selectedLead.contact_person}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8983] block mb-0.5">Salesperson</span>
                    <span className="font-semibold text-[#171717]">{selectedLead.salesperson}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8983] block mb-0.5">Email</span>
                    <span className="text-[#171717]">{selectedLead.email}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8983] block mb-0.5">Telepon</span>
                    <span className="text-[#171717] font-mono">{selectedLead.phone}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:border-l md:border-[#E7E3DD] md:pl-8">
                <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">Profil Kredit Pelanggan</h3>
                {customer ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#8C8983] block mb-0.5">Termin Pembayaran</span>
                      <span className="font-mono font-semibold text-[#171717]">{customer.payment_terms}</span>
                    </div>
                    <div>
                      <span className="text-[#8C8983] block mb-0.5">Batas Kredit</span>
                      <span className="font-mono font-semibold text-[#171717]">
                        Rp{customer.credit_limit_idr.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C8983] block mb-0.5">Sisa Ruang Kredit</span>
                      <span className="font-mono font-semibold text-[#54745B]">
                        Rp{Math.max(0, customer.credit_limit_idr - customer.open_receivable).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C8983] block mb-0.5">Dokumen Penawaran</span>
                      <span className="font-mono text-[#171717]">
                        {linkedQuotation ? `${linkedQuotation.order_id} (${linkedQuotation.status})` : 'Belum dibuat'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#8C8983]">Data pelanggan tidak ditemukan.</p>
                )}
              </div>
            </div>

            <Chatter
              documentId={selectedLead.lead_id}
              module="CRM"
              notes={selectedLead.notes}
              onAddNote={(note) => addLeadNote(selectedLead.lead_id, note)}
            />
          </div>
        </div>

        {/* MODAL: EDIT PROSPEK */}
        {editLeadOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFEFC] border border-[#E7E3DD] rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Pencil className="w-4 h-4 text-[#C18B42]" />
                  <div>
                    <h2 className="text-base font-bold text-[#171717]">Edit Prospek {selectedLead.lead_id}</h2>
                    <p className="text-xs text-[#8C8983]">Ubah rincian atau kembalikan tahap prospek secara langsung.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditLeadOpen(false)}
                  className="p-1.5 rounded-lg text-[#8C8983] hover:text-[#171717] hover:bg-[#F5F0E8] transition-colors"
                  aria-label="Tutup modal edit"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={(e) => handleEditLeadSubmit(e, selectedLead.lead_id)} className="p-6 space-y-4">
                {editError && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                    {editError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Judul Kebutuhan / Permintaan <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">Tahap Pipeline</label>
                    <select
                      value={editStage}
                      onChange={(e) => setEditStage(e.target.value as CRMLead['stage'])}
                      className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                    >
                      {STAGE_META.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.step}. {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">Estimasi Nilai (Rp)</label>
                    <input
                      type="text"
                      value={editRevenue}
                      onChange={(e) => setEditRevenue(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">Prioritas</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as CRMLead['priority'])}
                      className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                    >
                      <option value="high">Tinggi</option>
                      <option value="medium">Sedang</option>
                      <option value="low">Rendah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">Nama Kontak (PIC)</label>
                    <input
                      type="text"
                      value={editContactPerson}
                      onChange={(e) => setEditContactPerson(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">Telepon</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E7E3DD] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditLeadOpen(false)}
                    className="px-4 py-2 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717] hover:bg-[#F5F0E8] transition-colors whitespace-nowrap"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#171717] hover:bg-[#282828] text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // MAIN CRM VIEW
  // ============================================================================
  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        title="CRM & Pelanggan"
        subtitle="Kelola prospek penjualan langkah demi langkah dan tambahkan data pelanggan baru."
        onCreateNew={() => openAddLeadModal()}
        createButtonLabel="Tambah Prospek"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterOptions={
          viewMode === 'customers'
            ? []
            : [
                { label: 'Semua Tahap', value: 'all' },
                ...STAGE_META.map((s) => ({ label: `${s.step}. ${s.label}`, value: s.key })),
              ]
        }
        activeFilter={stageFilter}
        onFilterChange={setStageFilter}
        extraActions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAddCustomerOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#C18B42]" />
              <span>Tambah Pelanggan</span>
            </button>

            {/* Clean Segmented Switcher */}
            <div className="flex items-center p-0.5 bg-[#F5F0E8] rounded-lg border border-[#E7E3DD]">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'kanban' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983] hover:text-[#171717]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Pipeline</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'list' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983] hover:text-[#171717]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Daftar</span>
              </button>
              <button
                onClick={() => setViewMode('customers')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'customers' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#8C8983] hover:text-[#171717]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pelanggan ({customers.length})</span>
              </button>
            </div>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* 4-Column Pipeline Summary Strip (Single Elevation, Hairline Dividers) */}
        <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E3DD]">
          <div className="p-5">
            <div className="text-xs text-[#8C8983] font-medium">Prospek Berjalan</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#171717] mt-1">
              {activeLeads.length} Prospek
            </div>
            <div className="text-xs text-[#8C8983] mt-1">
              {waitingQuoteCount} siap dibuatkan penawaran
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs text-[#8C8983] font-medium">Potensi Nilai Penjualan</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#171717] mt-1">
              Rp{activePipelineValue.toLocaleString()}
            </div>
            <div className="text-xs text-[#8C8983] mt-1">Estimasi total prospek aktif</div>
          </div>

          <div className="p-5">
            <div className="text-xs text-[#8C8983] font-medium">Deal Menang</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#15803D] mt-1">
              Rp{wonValue.toLocaleString()}
            </div>
            <div className="text-xs text-[#8C8983] mt-1">{wonLeads.length} prospek berhasil deal</div>
          </div>

          <button
            type="button"
            onClick={() => setViewMode('customers')}
            className="p-5 text-left hover:bg-[#F9F7F2] transition-colors rounded-b-xl lg:rounded-b-none lg:rounded-r-xl"
          >
            <div className="text-xs text-[#8C8983] font-medium flex items-center justify-between">
              <span>Pelanggan Terdaftar</span>
              <span className="text-[#C18B42] font-semibold">Lihat Semua ›</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#171717] mt-1">
              {customers.length} Pelanggan
            </div>
            <div className="text-xs text-[#8C8983] mt-1">
              {b2bCount} B2B · {retailCount} Ritel
            </div>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* VIEW 1: KANBAN PIPELINE                                               */}
        {/* ===================================================================== */}
        {viewMode === 'kanban' && (
          <>
            {/* Simple Step Guide for Easy Understanding */}
            <div className="bg-[#FFFEFC] border border-[#E7E3DD] rounded-xl px-5 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="text-xs font-semibold text-[#171717] shrink-0">Alur Proses CRM:</div>
              <div className="flex items-center gap-2 flex-wrap text-xs text-[#525252]">
                <span>1. Tambah Pelanggan & Prospek</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8C8983]" />
                <span>2. Proses ke Peluang</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8C8983]" />
                <span>3. Buat Penawaran (Quotation)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8C8983]" />
                <span className="font-semibold text-[#15803D]">4. Deal Menang</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {STAGE_META.filter((st) => stageFilter === 'all' || st.key === stageFilter).map((stage) => {
                const stageLeads = filteredLeads.filter((l) => l.stage === stage.key);
                const stageTotal = stageLeads.reduce((sum, l) => sum + l.expected_revenue, 0);
                const isDropTarget = dragOverStage === stage.key;

                return (
                  <div
                    key={stage.key}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverStage !== stage.key) setDragOverStage(stage.key);
                    }}
                    onDragLeave={() => {
                      if (dragOverStage === stage.key) setDragOverStage(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedId = e.dataTransfer.getData('text/plain') || draggedLeadId;
                      if (droppedId) {
                        updateLeadStage(droppedId, stage.key);
                      }
                      setDraggedLeadId(null);
                      setDragOverStage(null);
                    }}
                    className={`flex flex-col rounded-xl border p-3.5 min-h-[420px] transition-colors ${
                      isDropTarget
                        ? 'bg-[#EAE5DC] border-[#171717]'
                        : 'bg-[#EAE5DC]/70 border-[#E7E3DD]'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="pb-3 mb-3 border-b border-[#D5CEBF] flex items-start justify-between gap-2">
                      <div>
                        <div className={`text-xs font-bold ${stage.accentClass}`}>
                          {stage.step}. {stage.label}
                        </div>
                        <div className="text-[11px] text-[#8C8983] mt-0.5">{stage.helper}</div>
                        <div className="font-mono tabular-nums text-xs font-semibold text-[#171717] mt-1.5">
                          Rp{stageTotal.toLocaleString()}
                        </div>
                      </div>
                      <span className="font-mono tabular-nums text-xs font-semibold text-[#171717] px-2 py-0.5 bg-[#FFFEFC] rounded border border-[#E7E3DD]">
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Cards List */}
                    <div className="space-y-3 flex-1">
                      {stageLeads.length === 0 ? (
                        <div className="h-28 rounded-lg border border-dashed border-[#D5CEBF] flex flex-col items-center justify-center text-center px-3">
                          <span className="text-xs text-[#8C8983]">Belum ada prospek</span>
                          {stage.key === 'new' && (
                            <button
                              type="button"
                              onClick={() => openAddLeadModal()}
                              className="mt-2 text-xs font-semibold text-[#C18B42] hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Tambah Prospek</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        stageLeads.map((lead) => {
                          const cust = getCustomer(lead.customer_id);
                          const prio = PRIORITY_LABEL[lead.priority];

                          return (
                            <div
                              key={lead.lead_id}
                              draggable
                              onDragStart={(e) => {
                                setDraggedLeadId(lead.lead_id);
                                e.dataTransfer.setData('text/plain', lead.lead_id);
                              }}
                              onDragEnd={() => {
                                setDraggedLeadId(null);
                                setDragOverStage(null);
                              }}
                              onClick={() => setSelectedLeadId(lead.lead_id)}
                              className={`p-4 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] hover:border-[#171717] transition-colors cursor-pointer group flex flex-col gap-2.5 ${
                                draggedLeadId === lead.lead_id ? 'opacity-60' : ''
                              }`}
                            >
                              {/* Quiet unboxed metadata line */}
                              <div className="flex items-center gap-1.5 text-[11px] text-[#8C8983]">
                                <span className="font-mono font-semibold text-[#C18B42]">{lead.lead_id}</span>
                                <span aria-hidden="true">·</span>
                                <span className={`font-medium ${prio.colorClass}`}>{prio.text}</span>
                              </div>

                              {/* Title */}
                              <h4 className="font-semibold text-sm text-[#171717] group-hover:text-[#C18B42] leading-snug">
                                {lead.title}
                              </h4>

                              {/* Customer Name & City */}
                              <div className="text-xs text-[#525252] space-y-0.5">
                                <div className="font-medium text-[#171717] truncate">
                                  {cust?.name || lead.contact_person}
                                </div>
                                <div className="text-[11px] text-[#8C8983]">
                                  {cust ? `${cust.contact_type} · ${cust.city}` : lead.email}
                                </div>
                              </div>

                              {/* Revenue row */}
                              <div className="pt-2.5 border-t border-[#F5F0E8] flex items-center justify-between text-xs">
                                <span className="text-[#8C8983]">Estimasi</span>
                                <span className="font-mono tabular-nums font-bold text-[#171717]">
                                  Rp{lead.expected_revenue.toLocaleString()}
                                </span>
                              </div>

                              {/* Quick Forward & Back Action Buttons */}
                              <div className="pt-2 border-t border-[#F5F0E8]">
                                {lead.stage === 'new' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      convertLeadToOpportunity(lead.lead_id);
                                    }}
                                    className="w-full py-1.5 px-3 bg-[#171717] hover:bg-[#282828] text-white rounded-lg text-xs font-medium transition-colors"
                                  >
                                    Proses ke Peluang
                                  </button>
                                )}

                                {lead.stage === 'qualified' && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateLeadStage(lead.lead_id, 'new');
                                      }}
                                      title="Kembalikan ke 01. Prospek Baru"
                                      className="py-1.5 px-2.5 bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                                    >
                                      <RotateCcw className="w-3 h-3 text-[#8C8983]" />
                                      <span>Kembali</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (lead.converted_quotation_id) {
                                          updateLeadStage(lead.lead_id, 'proposition');
                                        } else {
                                          convertOpportunityToQuotation(lead.lead_id);
                                        }
                                      }}
                                      className="flex-1 py-1.5 px-2.5 bg-[#54745B] hover:bg-[#435e49] text-white rounded-lg text-xs font-medium transition-colors truncate"
                                    >
                                      {lead.converted_quotation_id ? 'Ke Penawaran' : 'Buat Penawaran'}
                                    </button>
                                  </div>
                                )}

                                {lead.stage === 'proposition' && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateLeadStage(lead.lead_id, 'qualified');
                                      }}
                                      title="Kembalikan ke 02. Peluang Siap"
                                      className="py-1.5 px-2 bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                                    >
                                      <RotateCcw className="w-3 h-3 text-[#8C8983]" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateLeadStage(lead.lead_id, 'won');
                                      }}
                                      className="flex-1 py-1.5 px-2.5 bg-[#171717] hover:bg-[#282828] text-white rounded-lg text-xs font-medium transition-colors"
                                    >
                                      Tandai Menang
                                    </button>
                                    {lead.converted_quotation_id && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveApp('sales');
                                          setActiveView('quotations');
                                        }}
                                        className="py-1.5 px-2 bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] rounded-lg text-xs font-mono font-semibold shrink-0"
                                        title="Buka di Modul Sales"
                                      >
                                        {lead.converted_quotation_id}
                                      </button>
                                    )}
                                  </div>
                                )}

                                {lead.stage === 'won' && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateLeadStage(lead.lead_id, 'proposition');
                                      }}
                                      title="Kembalikan ke 03. Penawaran Dikirim"
                                      className="py-1.5 px-2.5 bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                                    >
                                      <RotateCcw className="w-3 h-3 text-[#8C8983]" />
                                      <span>Kembali</span>
                                    </button>
                                    <span className="flex-1 text-[11px] font-medium text-[#8C8983] text-right">
                                      Lihat detail ›
                                    </span>
                                  </div>
                                )}

                                {lead.stage === 'lost' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateLeadStage(lead.lead_id, 'new');
                                    }}
                                    className="w-full py-1.5 px-3 bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <RotateCcw className="w-3 h-3 text-[#8C8983]" />
                                    <span>Aktifkan Kembali</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: DAFTAR PROSPEK (LIST TABLE VIEW)                              */}
        {/* ===================================================================== */}
        {viewMode === 'list' && (
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#171717]">Daftar Seluruh Prospek Penjualan</h3>
                <p className="text-xs text-[#8C8983]">Klik baris untuk melihat detail riwayat & catatan pelanggan.</p>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#8C8983]">
                {filteredLeads.length} Prospek
              </span>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-semibold text-[#171717]">Tidak ada prospek yang sesuai pencarian</p>
                <p className="text-xs text-[#8C8983] mt-1">Tambahkan prospek baru atau ubah kata kunci pencarian Anda.</p>
                <button
                  onClick={() => openAddLeadModal()}
                  className="mt-4 px-4 py-2 bg-[#171717] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Prospek</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                    <tr>
                      <th className="py-3 px-6">ID</th>
                      <th className="py-3 px-6">Kebutuhan / Judul</th>
                      <th className="py-3 px-6">Pelanggan</th>
                      <th className="py-3 px-6">Tahap</th>
                      <th className="py-3 px-6">Prioritas</th>
                      <th className="py-3 px-6 text-right">Estimasi Nilai</th>
                      <th className="py-3 px-6">Salesperson</th>
                      <th className="py-3 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3DD]">
                    {filteredLeads.map((lead) => {
                      const cust = getCustomer(lead.customer_id);
                      const st = STAGE_META.find((s) => s.key === lead.stage) || STAGE_META[0];
                      const prio = PRIORITY_LABEL[lead.priority];

                      return (
                        <tr
                          key={lead.lead_id}
                          onClick={() => setSelectedLeadId(lead.lead_id)}
                          className="hover:bg-[#F9F7F2] transition-colors cursor-pointer"
                        >
                          <td className="py-3.5 px-6 font-mono font-semibold text-[#C18B42] whitespace-nowrap">
                            {lead.lead_id}
                          </td>
                          <td className="py-3.5 px-6 font-semibold text-[#171717]">{lead.title}</td>
                          <td className="py-3.5 px-6">
                            <div className="font-medium text-[#171717]">{cust?.name || lead.contact_person}</div>
                            <div className="text-[11px] text-[#8C8983]">{cust?.city || '-'}</div>
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={lead.stage}
                              onChange={(e) => updateLeadStage(lead.lead_id, e.target.value as CRMLead['stage'])}
                              className={`px-2 py-1 text-xs font-semibold bg-[#F5F0E8] border border-[#E7E3DD] rounded-md focus:outline-none focus:border-[#171717] ${st.accentClass}`}
                            >
                              {STAGE_META.map((s) => (
                                <option key={s.key} value={s.key} className="text-[#171717]">
                                  {s.step}. {s.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className={`py-3.5 px-6 whitespace-nowrap ${prio.colorClass}`}>
                            {prio.text.replace('Prioritas ', '')}
                          </td>
                          <td className="py-3.5 px-6 text-right font-mono tabular-nums font-bold text-[#171717] whitespace-nowrap">
                            Rp{lead.expected_revenue.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-6 text-[#525252] whitespace-nowrap">{lead.salesperson}</td>
                          <td className="py-3.5 px-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {getPreviousStage(lead.stage) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const prev = getPreviousStage(lead.stage);
                                    if (prev) updateLeadStage(lead.lead_id, prev.key);
                                  }}
                                  title={`Kembalikan ke ${getPreviousStage(lead.stage)?.label}`}
                                  className="px-2 py-1 bg-[#F5F0E8] hover:bg-[#EAE5DC] text-[#171717] border border-[#E7E3DD] rounded text-[11px] font-medium inline-flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3 text-[#8C8983]" />
                                  <span>Kembali</span>
                                </button>
                              )}
                              {lead.stage === 'new' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    convertLeadToOpportunity(lead.lead_id);
                                  }}
                                  className="px-2.5 py-1 bg-[#171717] text-white rounded text-[11px] font-medium"
                                >
                                  Proses Peluang
                                </button>
                              ) : lead.stage === 'qualified' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (lead.converted_quotation_id) {
                                      updateLeadStage(lead.lead_id, 'proposition');
                                    } else {
                                      convertOpportunityToQuotation(lead.lead_id);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-[#54745B] text-white rounded text-[11px] font-medium"
                                >
                                  {lead.converted_quotation_id ? 'Ke Penawaran' : 'Buat Penawaran'}
                                </button>
                              ) : (
                                <span className="text-[11px] font-semibold text-[#C18B42] pl-1">Detail ›</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 3: DAFTAR PELANGGAN (ADD & MANAGE CUSTOMERS IN CRM)              */}
        {/* ===================================================================== */}
        {viewMode === 'customers' && (
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E3DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-[#171717]">Direktori Pelanggan CRM</h3>
                <p className="text-xs text-[#8C8983]">
                  Tambahkan pelanggan baru atau langsung buatkan prospek penjualan dari daftar pelanggan.
                </p>
              </div>
              <button
                onClick={() => setAddCustomerOpen(true)}
                className="px-4 py-2 bg-[#171717] hover:bg-[#282828] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Pelanggan Baru</span>
              </button>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-semibold text-[#171717]">Pelanggan tidak ditemukan</p>
                <p className="text-xs text-[#8C8983] mt-1">Ubah pencarian atau tambahkan pelanggan baru.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F0E8] text-[#8C8983] font-semibold border-b border-[#E7E3DD]">
                    <tr>
                      <th className="py-3 px-6">ID</th>
                      <th className="py-3 px-6">Nama Pelanggan</th>
                      <th className="py-3 px-6">Tipe</th>
                      <th className="py-3 px-6">Kota</th>
                      <th className="py-3 px-6">Kontak</th>
                      <th className="py-3 px-6">Termin</th>
                      <th className="py-3 px-6 text-right">Batas Kredit</th>
                      <th className="py-3 px-6 text-right">Piutang</th>
                      <th className="py-3 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3DD]">
                    {filteredCustomers.map((c) => (
                      <tr key={c.contact_id} className="hover:bg-[#F9F7F2] transition-colors">
                        <td className="py-3.5 px-6 font-mono font-semibold text-[#C18B42] whitespace-nowrap">
                          {c.contact_id}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-[#171717]">{c.name}</td>
                        <td className="py-3.5 px-6 text-[#525252] whitespace-nowrap">{c.contact_type}</td>
                        <td className="py-3.5 px-6 text-[#171717] whitespace-nowrap">{c.city}</td>
                        <td className="py-3.5 px-6">
                          <div className="text-[#171717] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#8C8983]" />
                            <span>{c.email}</span>
                          </div>
                          <div className="text-[11px] text-[#8C8983] flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3" />
                            <span>{c.phone}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 font-mono font-semibold text-[#171717] whitespace-nowrap">
                          {c.payment_terms}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono tabular-nums text-[#171717] whitespace-nowrap">
                          Rp{c.credit_limit_idr.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono tabular-nums text-[#8C8983] whitespace-nowrap">
                          Rp{c.open_receivable.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <button
                            onClick={() => openAddLeadModal(c.contact_id)}
                            className="px-3 py-1.5 bg-[#F5F0E8] hover:bg-[#171717] text-[#171717] hover:text-white border border-[#E7E3DD] rounded-lg text-xs font-medium transition-colors"
                          >
                            + Buat Prospek
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Bottom Widgets: Sales Trend & Sales by Product */}
        {viewMode !== 'customers' && (
          <div className="pt-4 border-t border-[#E7E3DD]">
            <div className="text-xs font-semibold text-[#8C8983] mb-3">
              Ringkasan Tren Penjualan & Produk
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SalesTrendChart title="Tren Penjualan" subtitle="Korelasi prospek pipeline terhadap realisasi transaksi" />
              <SalesByProductChart title="Penjualan per Produk" />
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL: TAMBAH PROSPEK BARU                                            */}
      {/* ===================================================================== */}
      {addLeadOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFEFC] border border-[#E7E3DD] rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E3DD] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#C18B42]" />
                <div>
                  <h2 className="text-base font-bold text-[#171717]">Tambah Prospek Penjualan</h2>
                  <p className="text-xs text-[#8C8983]">Catat permintaan pelanggan baru ke dalam pipeline CRM.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddLeadOpen(false)}
                className="p-1.5 rounded-lg text-[#8C8983] hover:text-[#171717] hover:bg-[#F5F0E8] transition-colors"
                aria-label="Tutup modal prospek"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} className="p-6 space-y-4">
              {leadError && (
                <div className="px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {leadError}
                </div>
              )}

              {/* Pilih Pelanggan + Tombol Tambah Pelanggan Inline */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#171717]">
                    Pelanggan <span className="text-red-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setAddCustomerOpen(true)}
                    className="text-xs font-semibold text-[#C18B42] hover:underline flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ Pelanggan Baru</span>
                  </button>
                </div>
                <select
                  value={leadCustomerId}
                  onChange={(e) => handleSelectLeadCustomer(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                >
                  {customers.map((c) => (
                    <option key={c.contact_id} value={c.contact_id}>
                      {c.name} ({c.contact_type} · {c.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Judul Kebutuhan */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Judul Kebutuhan / Permintaan <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pesanan 10 Kaos Hitam untuk Event"
                  value={leadTitle}
                  onChange={(e) => setLeadTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              {/* Estimasi Nilai & Prioritas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">Estimasi Nilai (Rp)</label>
                  <input
                    type="text"
                    value={leadRevenue}
                    onChange={(e) => setLeadRevenue(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                  <p className="text-[11px] text-[#8C8983] mt-1 font-mono">
                    Rp{(Number(leadRevenue) || 0).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">Prioritas</label>
                  <select
                    value={leadPriority}
                    onChange={(e) => setLeadPriority(e.target.value as CRMLead['priority'])}
                    className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    <option value="high">Tinggi</option>
                    <option value="medium">Sedang</option>
                    <option value="low">Rendah</option>
                  </select>
                </div>
              </div>

              {/* Kontak PIC & Tahap Awal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">Nama Kontak (PIC)</label>
                  <input
                    type="text"
                    value={leadContactPerson}
                    onChange={(e) => setLeadContactPerson(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">Tahap Awal</label>
                  <select
                    value={leadInitialStage}
                    onChange={(e) => setLeadInitialStage(e.target.value as 'new' | 'qualified')}
                    className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    <option value="new">01. Prospek Baru</option>
                    <option value="qualified">02. Peluang Siap</option>
                  </select>
                </div>
              </div>

              {/* Catatan Awal */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">Catatan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Detail ukuran, warna, atau jadwal kebutuhan pelanggan..."
                  value={leadNote}
                  onChange={(e) => setLeadNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F0E8] border border-[#E7E3DD] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div className="pt-4 border-t border-[#E7E3DD] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddLeadOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717] hover:bg-[#F5F0E8] transition-colors whitespace-nowrap"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#171717] hover:bg-[#282828] text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Simpan Prospek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: TAMBAH PELANGGAN BARU                                          */}
      {/* ===================================================================== */}
      <AddCustomerModal
        isOpen={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onCreated={handleCustomerCreated}
      />
    </div>
  );
};
