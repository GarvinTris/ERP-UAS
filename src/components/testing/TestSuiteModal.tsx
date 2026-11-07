import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { TEST_SCENARIOS_CATALOG } from '../../data/seedData';

export const TestSuiteModal: React.FC = () => {
  const { testSuiteOpen, setTestSuiteOpen, runAutomatedTest, runAllTests, resetToBaselineSeed, testResults } = useERP();

  const [activeTab, setActiveTab] = useState<'tests' | 'defense' | 'reflection'>('tests');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [runningTestId, setRunningTestId] = useState<string | null>(null);

  if (!testSuiteOpen) return null;

  const categories = ['all', ...Array.from(new Set(TEST_SCENARIOS_CATALOG.map((t) => t.category)))];

  const filteredTests = TEST_SCENARIOS_CATALOG.filter((t) => {
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchSearch =
      searchQuery === '' ||
      t.test_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.rule_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.situation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const passedCount = Object.values(testResults).filter((r) => r.status === 'passed').length;

  const handleRunSingle = async (testId: string) => {
    setRunningTestId(testId);
    await runAutomatedTest(testId);
    setRunningTestId(null);
  };

  const DECISION_DEFENSE_DATA = [
    {
      conflict: 'SR-01 vs SR-02 (Penagihan SO vs Pengiriman Nyata)',
      optA: 'Opsi A: Mengizinkan penagihan langsung atas seluruh SO saat konfirmasi (Nadya/Sales)',
      optB: 'Opsi B: Invoice hanya boleh terbit sebesar kuantitas yang telah terkirim (Fajar/Finance)',
      decision: 'Keputusan: Opsi B diterapkan ketat pada F-09 dan S-10 (Invoice berbasis pengiriman).',
      tradeoff: 'Pihak dirugikan: Tim Penjualan tidak bisa menagih di muka; mitigasi: mempercepat koordinasi pengiriman parsial dengan Delivery Order dan backorder.',
      evidence: 'T-20 (Invoice 2 unit dari 3), T-21 (Penolakan invoice 3 unit)',
    },
    {
      conflict: 'SR-03 vs SR-04 (Penjualan POS vs Integritas Stok Fisik)',
      optA: 'Opsi A: Kasir boleh terus menjual meski komputer mencatat stok habis (Salsa/Toko)',
      optB: 'Opsi B: Stok tidak boleh negatif, transaksi POS ditolak jika stok toko kurang (Bayu/Gudang)',
      decision: 'Keputusan: Opsi B diterapkan pada F-16 dan S-14 (Validasi stok toko STORE-BDG sebelum payment).',
      tradeoff: 'Pihak dirugikan: Kasir kehilangan potensi penjualan sesaat jika data sistem kosong; mitigasi: fitur Internal Transfer instan dari WH-JKT (SR-12, F-18).',
      evidence: 'T-28 (POS sukses stok cukup), T-29 (Penolakan POS stok kurang)',
    },
    {
      conflict: 'SR-05 vs SR-06 (Vendor Bill saat PO vs Three-Way Matching)',
      optA: 'Opsi A: Vendor bill dibukukan saat PO disetujui untuk akrual cepat (Rizki/Pembelian)',
      optB: 'Opsi B: Vendor bill dibatasi kuantitas yang lolos inspeksi kualitas QA (Fajar/Finance)',
      decision: 'Keputusan: Opsi B Three-Way Matching diterapkan pada F-13 dan S-11.',
      tradeoff: 'Pihak dirugikan: Vendor mungkin menunggu proses QA selesai sebelum penagihan resmi; mitigasi: audit penerimaan cepat di S-09 dengan akun transitori GRNI 1210.',
      evidence: 'T-18 (Penerimaan 3 unit lolos QA), T-22 (Bill 3 unit), T-23 (Penolakan bill 4 unit)',
    },
    {
      conflict: 'SR-07 (Retur Pelanggan & Pemulihan Persediaan)',
      optA: 'Opsi A: Retur langsung otomatis menambah stok dan menerbitkan Credit Note di kasir',
      optB: 'Opsi B: Retur wajib inspeksi gudang; hanya unit fisik lolos QC yang menambah stok dan berhak Credit Note',
      decision: 'Keputusan: Opsi B diterapkan pada F-17 dan S-15.',
      tradeoff: 'Pihak dirugikan: Pelanggan menunggu verifikasi fisik; mitigasi: pencatatan inspeksi transparan dan pembalikan HPP otomatis.',
      evidence: 'T-30 (Retur 1 unit diterima layak, HPP dibalik Rp80k), T-31 (Penolakan CN melebihi retur fisik)',
    },
    {
      conflict: 'SR-08 (Fleksibilitas Diskon Penjualan vs Penguncian Dokumen)',
      optA: 'Opsi A: Sales boleh memberikan diskon fleksibel kapan saja tanpa pembatasan',
      optB: 'Opsi B: Diskon <= 10% mandiri, > 10% butuh approval Manajer, dokumen Confirmed terkunci',
      decision: 'Keputusan: Opsi B diterapkan pada F-06 dan S-05.',
      tradeoff: 'Pihak dirugikan: Sales rep butuh persetujuan manajer untuk diskon besar; mitigasi: audit log lengkap dan workflow approval cepat.',
      evidence: 'T-11 (Penguncian harga S00007), T-34 (Diskon 10% lolos), T-35 (Diskon 15% ditahan)',
    },
    {
      conflict: 'SR-10 (Penjualan Kredit Bebas vs Kontrol Eksposur Piutang)',
      optA: 'Opsi A: Semua pesanan disetujui demi omzet penjualan',
      optB: 'Opsi B: Total eksposur (piutang terbuka + order baru) tidak boleh melebihi Credit Limit, pelanggan TUNAI dilarang kredit',
      decision: 'Keputusan: Opsi B diterapkan pada F-10 dan S-05.',
      tradeoff: 'Pihak dirugikan: Pelanggan dengan kredit penuh tertahan; mitigasi: modal dialog credit exposure transparan dan prioritas pelunasan faktur.',
      evidence: 'T-04 (Penolakan kredit C04 TUNAI), T-09 (C03 limit cukup), T-10 (C02 over-limit ditolak)',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8">
      <div className="bg-[#1E1E1E] border border-[#333333] rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#FFFEFC]">
        {/* Top Header */}
        <div className="p-6 border-b border-[#2E2E2E] flex items-center justify-between bg-[#171717]">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#C18B42] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PT Rona Karsa Apparel · Rubrik Penilaian Proyek</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
              Pusat Pengujian Skenario T-01 s/d T-36 & Decision Defense
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => runAllTests()}
              className="px-3.5 py-2 bg-[#54745B] hover:bg-[#435e49] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Jalankan Semua 36 Tes</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset ke baseline seed awal 106 unit?')) resetToBaselineSeed();
              }}
              className="p-2 bg-[#282828] hover:bg-[#333333] text-[#D5CEBF] rounded-lg transition-colors"
              title="Reset Database ke Baseline Seed"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTestSuiteOpen(false)}
              className="p-2 text-[#8C8983] hover:text-white rounded-lg hover:bg-[#282828] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-[#2E2E2E] bg-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'tests'
                  ? 'border-[#C18B42] text-white font-semibold'
                  : 'border-transparent text-[#8C8983] hover:text-white'
              }`}
            >
              <span>Daftar Skenario T-xx</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#282828] text-[#54745B]">
                {passedCount}/36 Lulus
              </span>
            </button>

            <button
              onClick={() => setActiveTab('defense')}
              className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'defense'
                  ? 'border-[#C18B42] text-white font-semibold'
                  : 'border-transparent text-[#8C8983] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C18B42]" />
              <span>Decision Defense (Matriks Konflik SR)</span>
            </button>

            <button
              onClick={() => setActiveTab('reflection')}
              className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'reflection'
                  ? 'border-[#C18B42] text-white font-semibold'
                  : 'border-transparent text-[#8C8983] hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#C18B42]" />
              <span>Jawaban Pertanyaan Refleksi</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#171717]">
          {activeTab === 'tests' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1E1E1E] p-3 rounded-xl border border-[#2E2E2E]">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-[#8C8983]" />
                  <div className="flex gap-1.5 flex-wrap">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                          filterCategory === cat
                            ? 'bg-[#C18B42] text-black font-semibold'
                            : 'bg-[#282828] text-[#A6A29A] hover:text-white'
                        }`}
                      >
                        {cat === 'all' ? 'Semua Kategori' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8983]" />
                  <input
                    type="text"
                    placeholder="Cari ID tes atau aturan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#282828] text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-[#3A3A3A] focus:outline-none focus:border-[#C18B42]"
                  />
                </div>
              </div>

              {/* Tests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTests.map((t) => {
                  const res = testResults[t.test_id];
                  const isRunning = runningTestId === t.test_id;

                  return (
                    <div
                      key={t.test_id}
                      className="p-4 rounded-xl bg-[#1E1E1E] border border-[#2E2E2E] hover:border-[#3A3A3A] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#C18B42] bg-[#C18B42]/10 px-2 py-0.5 rounded border border-[#C18B42]/20">
                              {t.test_id}
                            </span>
                            <span className="text-[11px] text-[#8C8983]">{t.feature_id} · {t.rule_id}</span>
                          </div>

                          {res ? (
                            <span
                              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                                res.status === 'passed'
                                  ? 'bg-[#54745B]/20 text-[#54745B] border border-[#54745B]/40'
                                  : 'bg-[#B94B4B]/20 text-[#B94B4B] border border-[#B94B4B]/40'
                              }`}
                            >
                              {res.status === 'passed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              <span>{res.status.toUpperCase()}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#6E6B65] bg-[#282828] px-2 py-0.5 rounded">
                              Belum Dijalankan
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-sm text-white">{t.title}</h3>

                        <div className="mt-2 text-xs space-y-1.5 text-[#C7C3BB]">
                          <div>
                            <span className="text-[#8C8983]">Situasi: </span>
                            <span>{t.situation}</span>
                          </div>
                          <div>
                            <span className="text-[#8C8983]">Ekspektasi: </span>
                            <span className="text-[#E8E4DE]">{t.expected}</span>
                          </div>
                          {res && (
                            <div className="pt-2 border-t border-[#2E2E2E]">
                              <span className="text-[#54745B] font-semibold">Hasil Aktual: </span>
                              <span className="text-[#A6A29A]">{res.actual}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex items-center justify-between text-[11px]">
                        <span className="text-[#8C8983]">Bukti: {t.required_evidence}</span>
                        <button
                          onClick={() => handleRunSingle(t.test_id)}
                          disabled={isRunning}
                          className="px-3 py-1 bg-[#282828] hover:bg-[#333333] hover:text-[#C18B42] text-white rounded-md transition-colors flex items-center gap-1.5 font-medium border border-[#3A3A3A]"
                        >
                          <Play className="w-3 h-3" />
                          <span>{isRunning ? 'Menguji...' : 'Uji Sekarang'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'defense' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#1E1E1E] border border-[#2E2E2E] text-xs text-[#C7C3BB]">
                <h3 className="font-bold text-white text-sm mb-1">
                  Format Wajib Decision Defense (Handout PDF Halaman 48)
                </h3>
                <p className="text-[#8C8983]">
                  Berikut adalah dokumentasi lengkap setiap ketegangan bisnis antara pemangku kepentingan (SR-xx), opsi yang dipertimbangkan, keputusan final dan mitigasi trade-off, beserta pembuktian pada pengujian sistem.
                </p>
              </div>

              <div className="space-y-3">
                {DECISION_DEFENSE_DATA.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[#1E1E1E] border border-[#2E2E2E] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#C18B42]">{item.conflict}</span>
                      <span className="text-xs font-mono text-[#54745B] bg-[#54745B]/10 px-2 py-0.5 rounded border border-[#54745B]/30">
                        {item.evidence}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#171717] p-3 rounded-lg border border-[#262626]">
                      <div className="text-[#A6A29A]">{item.optA}</div>
                      <div className="text-[#A6A29A]">{item.optB}</div>
                    </div>

                    <div className="text-xs">
                      <div className="font-semibold text-white">{item.decision}</div>
                      <div className="text-[#8C8983] mt-1">{item.tradeoff}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reflection' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Refleksi 1 */}
              <div className="p-6 rounded-xl bg-[#1E1E1E] border border-[#2E2E2E] space-y-3">
                <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#C18B42]">
                  Pertanyaan Refleksi 1 (Handout PDF Halaman 49)
                </div>
                <h3 className="text-base font-bold text-white">
                  Konflik antar pemangku kepentingan mana yang paling sulit diselesaikan? Jelaskan nilai yang dikorbankan dan mitigasinya.
                </h3>
                <div className="text-xs text-[#D5CEBF] leading-relaxed space-y-2.5 border-t border-[#2A2A2A] pt-3">
                  <p>
                    <strong>Konflik Utama:</strong> Ketegangan antara <strong>Nadya Kinasih (Manajer Penjualan - SR-01)</strong> yang ingin langsung menagih invoice penuh saat Sales Order disetujui, melawan <strong>Fajar Pratama (Kepala Keuangan - SR-02)</strong> yang bersikeras bahwa kuantitas yang ditagihkan tidak boleh melebihi jumlah yang benar-benar telah dikirim dan belum ditagih.
                  </p>
                  <p>
                    <strong>Nilai yang Dikorbankan (Trade-Off):</strong> Kecepatan cash flow penagihan di muka oleh tim Sales dikorbankan. Jika barang belum tersedia atau hanya dikirim sebagian (partial delivery), perusahaan tidak dapat mengakui piutang sebelum pengiriman tervalidasi.
                  </p>
                  <p>
                    <strong>Mitigasi Sistem:</strong> Sistem mengotomasi penerbitan <em>Delivery Order</em> secara bertahap dan memisahkan sisa kuantitas sebagai <em>Backorder</em> (F-08). Segera setelah gudang menekan tombol "Validate Delivery", sistem membuka opsi penerbitan Customer Invoice (F-09) secara instan hanya untuk unit yang sudah keluar fisik, sehingga pengakuan HPP (SR-09) dan penagihan tetap akurat tanpa melanggar prinsip akuntansi berbasis akrual barang dagang.
                  </p>
                </div>
              </div>

              {/* Refleksi 2 */}
              <div className="p-6 rounded-xl bg-[#1E1E1E] border border-[#2E2E2E] space-y-3">
                <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#C18B42]">
                  Pertanyaan Refleksi 2 (Handout PDF Halaman 49)
                </div>
                <h3 className="text-base font-bold text-white">
                  Pada bagian mana AI tool menghasilkan UI yang tampak benar tetapi melanggar aturan bisnis? Jelaskan cara mendeteksi dan menguji perbaikannya.
                </h3>
                <div className="text-xs text-[#D5CEBF] leading-relaxed space-y-2.5 border-t border-[#2A2A2A] pt-3">
                  <p>
                    <strong>Business-Rule Trap Terdeteksi:</strong> Tiga area kritis di mana AI coding tools sering menghasilkan antarmuka visual yang terlihat mulus namun keliru secara bisnis:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-[#A6A29A]">
                    <li>
                      <strong className="text-white">Reservasi Stok (SR-04):</strong> AI sering langsung memotong <code>on_hand</code> saat Sales Order dikonfirmasi. Aturan yang benar: <code>on_hand</code> tetap konstan, <code>reserved</code> bertambah, dan <code>available = on_hand - reserved</code>. Pengurangan stok fisik baru sah saat pengiriman/delivery divalidasi.
                    </li>
                    <li>
                      <strong className="text-white">Three-Way Matching (SR-06):</strong> AI sering mengizinkan pembuatan Vendor Bill langsung dari PO sebesar kuantitas pesanan. Aturan yang benar: Kuantitas tagihan bill dibatasi oleh unit yang lolos inspeksi penerimaan (<code>accepted_qty</code>), bukan unit yang di-reject atau belum tiba.
                    </li>
                    <li>
                      <strong className="text-white">Idempotency & Re-posting Jurnal (SR-15):</strong> Jika tombol 'Confirm' atau 'Validate' ditekan dua kali, UI default AI sering memicu pemotongan stok berulang atau jurnal ganda. Sistem wajib memiliki validasi status <code>done</code> dan kunci dokumen.
                    </li>
                  </ol>
                  <p>
                    <strong>Metode Deteksi & Pengujian:</strong> Kami mendeteksi dan menguji perbaikan melalui skenario pengujian <strong>T-11 s.d. T-14, T-18, T-23, dan T-27</strong> dengan memeriksa rekonsiliasi angka riil di buku besar jurnal dan tabel persediaan sebelum dan sesudah setiap aksi.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
