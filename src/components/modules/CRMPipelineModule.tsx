import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlPanel } from '../common/ControlPanel';
import { Chatter } from '../common/Chatter';
import { CRMLead } from '../../types/erp';
import {
  Users,
  Plus,
  ArrowRight,
  FileCheck,
  CheckCircle2,
  Calendar,
  Building,
  User,
  DollarSign,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { SalesTrendChart, SalesByProductChart } from '../common/AnalyticsCharts';

export const CRMPipelineModule: React.FC = () => {
  const {
    leads,
    convertLeadToOpportunity,
    convertOpportunityToQuotation,
    setActiveApp,
    setActiveView,
    salesOrders,
  } = useERP();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const stages: { key: CRMLead['stage']; label: string; color: string }[] = [
    { key: 'new', label: 'New', color: 'border-blue-400' },
    { key: 'qualified', label: 'Qualified (Opportunity)', color: 'border-amber-400' },
    { key: 'proposition', label: 'Proposition (Quotation)', color: 'border-purple-400' },
    { key: 'won', label: 'Won', color: 'border-emerald-500' },
    { key: 'lost', label: 'Lost', color: 'border-red-400' },
  ];

  const selectedLead = leads.find((l) => l.lead_id === selectedLeadId);

  // Lead Detail View
  if (selectedLead) {
    const linkedQuotation = salesOrders.find((s) => s.order_id === selectedLead.converted_quotation_id);

    return (
      <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
        <ControlPanel
          title={`Lead / Opportunity: ${selectedLead.title} (${selectedLead.lead_id})`}
          subtitle="Manajemen Pipeline Penjualan & Konversi Tertelusur (S-04)"
          extraActions={
            <button
              onClick={() => setSelectedLeadId(null)}
              className="px-3 py-1.5 bg-white border border-[#E7E3DD] rounded-lg text-xs font-medium text-[#171717] hover:bg-[#EAE5DC]"
            >
              Kembali ke Kanban
            </button>
          }
        />

        <div className="p-6 max-w-5xl mx-auto w-full">
          <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] shadow-xs p-8">
            {/* Header & Stage indicator */}
            <div className="flex items-start justify-between border-b border-[#E7E3DD] pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#C18B42] bg-[#C18B42]/10 px-2.5 py-0.5 rounded">
                    {selectedLead.lead_id}
                  </span>
                  <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-[#F5F0E8] text-[#171717]">
                    Stage: {selectedLead.stage.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[#171717]">{selectedLead.title}</h2>
                <div className="text-xs text-[#8C8983] mt-1">
                  Customer: <span className="text-[#171717] font-semibold">{selectedLead.customer_id}</span> · Contact: {selectedLead.contact_person}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-[#8C8983]">Expected Revenue</div>
                <div className="text-xl font-bold font-mono text-[#171717]">
                  Rp{selectedLead.expected_revenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Action buttons matching T-07 & T-08 requirements */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD] mb-6">
              {selectedLead.stage === 'new' && (
                <button
                  onClick={() => convertLeadToOpportunity(selectedLead.lead_id)}
                  className="px-4 py-2 bg-[#171717] hover:bg-[#282828] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#C18B42]" />
                  <span>Ubah Menjadi Opportunity (Uji T-07)</span>
                </button>
              )}

              {selectedLead.stage === 'qualified' && (
                <button
                  onClick={() => convertOpportunityToQuotation(selectedLead.lead_id)}
                  className="px-4 py-2 bg-[#171717] hover:bg-[#282828] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <FileCheck className="w-3.5 h-3.5 text-[#54745B]" />
                  <span>Konversi ke Quotation (Uji T-08)</span>
                </button>
              )}

              {selectedLead.converted_quotation_id && (
                <button
                  onClick={() => {
                    setActiveApp('sales');
                    setActiveView('quotations');
                  }}
                  className="px-4 py-2 bg-white border border-[#C18B42] text-[#171717] hover:bg-[#F9F7F2] rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#C18B42]" />
                  <span>Buka Quotation {selectedLead.converted_quotation_id}</span>
                </button>
              )}
            </div>

            {/* Lead information fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
              <div className="space-y-3">
                <div>
                  <label className="text-[#8C8983] block mb-0.5">Salesperson</label>
                  <div className="font-semibold text-[#171717]">{selectedLead.salesperson}</div>
                </div>
                <div>
                  <label className="text-[#8C8983] block mb-0.5">Email & Phone</label>
                  <div className="text-[#171717]">{selectedLead.email} · {selectedLead.phone}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[#8C8983] block mb-0.5">Tautan Asal & Riwayat (SR-15)</label>
                  <div className="text-[#171717] font-mono text-[11px]">
                    {selectedLead.converted_opportunity_id ? (
                      <span className="text-[#54745B] font-semibold">
                        Terhubung ke {selectedLead.converted_opportunity_id}
                      </span>
                    ) : (
                      'Belum dikonversi'
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Chatter documentId={selectedLead.lead_id} module="CRM" notes={selectedLead.notes} />
          </div>
        </div>
      </div>
    );
  }

  // Kanban View matching S-04
  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] overflow-y-auto">
      <ControlPanel
        screenCode="S-04"
        flowHint="S-04 Kelola prospek & peluang ➔ S-05 Quotation / Sales Order Form (F-04)"
        title="CRM Pipeline (Kanban)"
        subtitle="Kelola Lead & Opportunity hingga Penawaran Berdasarkan Tahapan Tertelusur (SR-15)"
      />

      <div className="p-6 max-w-7xl mx-auto w-full">
        {/* Kanban Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.key);
            const stageTotal = stageLeads.reduce((sum, l) => sum + l.expected_revenue, 0);

            return (
              <div key={stage.key} className="flex flex-col rounded-xl bg-[#EAE5DC]/80 p-3 min-h-[500px]">
                {/* Column header */}
                <div className={`border-t-2 ${stage.color} pt-2 pb-2 mb-2 flex items-center justify-between`}>
                  <div>
                    <h3 className="font-bold text-xs text-[#171717] uppercase tracking-wider">{stage.label}</h3>
                    <div className="font-mono text-[10px] text-[#8C8983] mt-0.5">
                      Rp{stageTotal.toLocaleString()}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-white rounded-md border border-[#E7E3DD]">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards in column */}
                <div className="space-y-2.5 flex-1">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.lead_id}
                      onClick={() => setSelectedLeadId(lead.lead_id)}
                      className="p-4 rounded-xl bg-[#FFFEFC] border border-[#E7E3DD] hover:border-[#171717] shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-mono font-bold text-[#C18B42]">{lead.lead_id}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-[#F5F0E8] text-[#171717]">
                          {lead.priority.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs text-[#171717] group-hover:text-[#C18B42] leading-snug">
                        {lead.title}
                      </h4>

                      <div className="text-[11px] text-[#8C8983] mt-2 flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span>Customer {lead.customer_id}</span>
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-[#F5F0E8] flex items-center justify-between text-xs font-mono">
                        <span className="text-[#8C8983]">Revenue:</span>
                        <span className="font-bold text-[#171717]">
                          Rp{lead.expected_revenue.toLocaleString()}
                        </span>
                      </div>

                      {/* Quick Action buttons */}
                      <div className="mt-3 pt-2 border-t border-[#F5F0E8] flex items-center justify-between">
                        {lead.stage === 'new' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              convertLeadToOpportunity(lead.lead_id);
                            }}
                            className="w-full text-center py-1 bg-[#171717] hover:bg-[#282828] text-white rounded text-[11px] font-medium"
                          >
                            Jadikan Opportunity (T-07)
                          </button>
                        )}
                        {lead.stage === 'qualified' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              convertOpportunityToQuotation(lead.lead_id);
                            }}
                            className="w-full text-center py-1 bg-[#54745B] hover:bg-[#435e49] text-white rounded text-[11px] font-medium"
                          >
                            Buat Quotation (T-08)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Storyboard S-04 Bottom Widgets: Sales Trend & Sales by Product */}
        <div className="mt-6 pt-6 border-t border-[#E7E3DD]">
          <div className="text-[11px] font-mono font-semibold uppercase text-[#8C8983] mb-3">
            Analitik Terintegrasi Pipeline (S-04 Storyboard)
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SalesTrendChart title="Sales Trend" subtitle="Korelasi deal pipeline terhadap realisasi transaksi" />
            <SalesByProductChart title="Sales by Product" />
          </div>
        </div>
      </div>
    </div>
  );
};
