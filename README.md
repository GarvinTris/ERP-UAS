# PT RONA KARSA APPAREL — ENTERPRISE FASHION ERP
> **Web-Based Enterprise Resource Planning (ERP)** terintegrasi bergaya **Odoo Web 17.0** untuk ritel omnichannel pakaian kasual essentials.

---

## 1. Identitas & Ringkasan Perusahaan

- **Nama Perusahaan:** PT Rona Karsa Apparel (Fiktif)
- **Industri:** Fashion & Apparel — Ritel Omnichannel Pakaian Kasual
- **Fasilitas:**
  - **Gudang Pusat Jakarta (`WH-JKT`):** Pusat penerimaan barang dari pemasok, penyimpanan grosir, dan pemenuhan pesanan B2B/e-commerce.
  - **Toko Ritel Bandung (`STORE-BDG`):** Toko fisik kasir (Point of Sale) dengan stok mandiri.
- **Mata Uang:** Indonesian Rupiah (IDR / Rp)
- **Pajak Simulasi:** PPN Efektif 11% (Tarif formal 12% × DPP nilai lain 11/12 sesuai PMK 131/2024).
- **Opening Baseline:**
  - Total Stok: **106 unit**
  - Nilai Persediaan: **Rp11.140.000**
  - Saldo Kas/Bank Mandiri: **Rp5.000.000**
  - Modal Disetor: **Rp16.140.000**
  - Sales Order S00007 menahan reservasi 3 unit `AP-TS-BLK-M` di `WH-JKT` (On Hand: 4, Reserved: 3, Available: 1).

---

## 2. Akun Uji Demo Sesuai Role (RBAC)

Aplikasi dilengkapi tombol **Quick Switch Role** dan pilihan akun uji langsung pada halaman Login:

| Peran | Nama Pegawai | Email | Tanggung Jawab & Batas Akses |
|---|---|---|---|
| **Owner / Admin** | Arga Mahendra | `owner@ronakarsa.com` | Akses penuh seluruh modul, otorisasi diskon & evaluasi bisnis |
| **Sales** | Nadya Kinasih | `sales@ronakarsa.com` | CRM, Kontak, Quotation, SO (Dilarang membuka seluruh jurnal akuntansi) |
| **Warehouse** | Bayu Firmansyah | `warehouse@ronakarsa.com` | Inventory, Stock Overview, Delivery Orders, Receipt QA, Transfer, Retur |
| **Finance** | Fajar Pratama | `finance@ronakarsa.com` | Customer Invoice, Vendor Bill, Register Payment, Jurnal Umum, Credit Note |
| **Cashier** | Salsa Widianti | `cashier@ronakarsa.com` | POS Kasir Toko Bandung, struk thermal, sinkronisasi stok toko |
| **Procurement** | Rizki Wardana | `procurement@ronakarsa.com` | Pemasok, RFQ, Purchase Order, Three-Way Matching monitor |

---

## 3. Cakupan 16 Kelompok Layar (S-01 s/d S-16)

1. **S-01 Beranda App Switcher:** Grid 13 modul aplikasi bergaya Odoo 17.0 dengan indikator hak akses dan badge dinamis.
2. **S-02 Form Contacts:** Master pelanggan C01–C06 dan vendor V01–V04, limit kredit, dan termin pembayaran.
3. **S-03 Form Products / Variants:** 15 varian fashion ber-SKU unik dengan atribut ukuran & warna, harga jual, dan biaya per unit.
4. **S-04 CRM Pipeline (Kanban):** Papan Kanban tahap New, Qualified, Proposition, Won, Lost; konversi ke Opportunity & Quotation tertelusur.
5. **S-05 Quotation / Sales Order Form:** Detail pemesanan multi-line, kalkulasi PPN 11%, diskon, validasi kredit, dan penguncian harga.
6. **S-06 Delivery Order Form:** Pengiriman parsial, pembentukan backorder otomatis, pengakuan HPP, dan pemotongan stok fisik.
7. **S-07 Stock Overview & Transfers:** Posisi stok On Hand, Reserved, Available per lokasi, serta form transfer antar lokasi (SR-12).
8. **S-08 RFQ / Purchase Order Form:** Pemesanan pembelian ke vendor, PPN masukan 11%, dan proteksi penguncian dokumen Confirmed.
9. **S-09 Receipt / Quality Acceptance Form:** Pencatatan kedatangan barang, inspeksi QA (Accepted vs Rejected), dan posting persediaan GRNI.
10. **S-10 Customer Invoice Form:** Faktur berbasis pengiriman nyata (SR-02), pembukuan piutang usaha & PPN keluaran.
11. **S-11 Vendor Bill Form:** Pencocokan tiga arah (Three-Way Match PO-Receipt-Bill) dan pengakuan utang dagang.
12. **S-12 Register Payment Dialog:** Pembayaran parsial/pelunasan bertahap piutang & utang, perhitungan saldo residual secara akurat.
13. **S-13 Journal Entries / General Ledger:** Pembukuan berpasangan (double-entry), audit keseimbangan Debit/Kredit, dan drill-down dokumen sumber.
14. **S-14 Point of Sale Checkout:** Antarmuka kasir toko retail, keranjang belanja, validasi stok toko, struk thermal, dan transaksi atomik.
15. **S-15 Customer Returns & Credit Note:** Inspeksi fisik retur gudang, pembalikan persediaan & HPP, dan penerbitan Credit Note.
16. **S-16 Sales & Inventory Dashboard:** 6 KPI utama (Net Sales, PPN, Gross Sales, Inventory, AR/AP, Unit Sold), filter kanal, dan penelusuran drill-down.

---

## 4. Format Wajib Decision Defense (Handout Hal. 48)

| Masalah/Konflik SR | Opsi Dipertimbangkan | Keputusan + F/S | Trade-Off / Siapa Dirugikan | Bukti Pengujian |
|---|---|---|---|---|
| **SR-01 vs SR-02**<br>Penagihan SO vs Pengiriman Nyata | **Opsi A:** Invoice langsung saat SO disetujui (Sales)<br>**Opsi B:** Invoice hanya terbit untuk kuantitas terkirim (Finance) | **Keputusan: Opsi B**<br>F-09, S-10 (Customer Invoice berbasis pengiriman) | **Sales dirugikan:** Tidak bisa menagih uang muka di awal tanpa pengiriman. Mitigasi: Koordinasi pengiriman parsial dan backorder cepat. | **T-20** (Invoice 2 unit dari 3 terkirim)<br>**T-21** (Penolakan invoice 3 unit) |
| **SR-03 vs SR-04**<br>Penjualan POS vs Integritas Stok Fisik | **Opsi A:** Kasir boleh menjual walau komputer kosong (Toko)<br>**Opsi B:** Stok tidak boleh negatif, transaksi ditolak jika stok kurang (Gudang) | **Keputusan: Opsi B**<br>F-16, S-14 (Validasi stok toko STORE-BDG sebelum bayar) | **Kasir dirugikan:** Potensi kehilangan pembeli jika barang belum diinput. Mitigasi: Internal Transfer instan dari WH-JKT. | **T-28** (POS sukses stok cukup)<br>**T-29** (Penolakan POS stok kurang) |
| **SR-05 vs SR-06**<br>Vendor Bill saat PO vs Three-Way Matching | **Opsi A:** Vendor bill dibukukan saat PO disetujui (Pembelian)<br>**Opsi B:** Vendor bill dibatasi barang lolos QA (Finance) | **Keputusan: Opsi B**<br>F-13, S-11 (Three-Way Matching ketat) | **Vendor dirugikan:** Menunggu inspeksi QA sebelum pembayaran disetujui. Mitigasi: Akun transitori GRNI 1210 pada penerimaan. | **T-18** (Receipt 3 unit lolos QA)<br>**T-22** (Bill 3 unit)<br>**T-23** (Penolakan bill 4 unit) |
| **SR-07**<br>Retur Pelanggan & Pemulihan Persediaan | **Opsi A:** Retur langsung menambah stok & Credit Note di kasir<br>**Opsi B:** Retur wajib inspeksi gudang; hanya unit layak restock yang dibalikkan HPP & berhak Credit Note | **Keputusan: Opsi B**<br>F-17, S-15 (Customer Returns & Credit Note) | **Pelanggan dirugikan:** Menunggu verifikasi fisik barang. Mitigasi: Pencatatan inspeksi transparan dan pembalikan HPP otomatis. | **T-30** (Retur 1 unit layak restock, HPP dibalik)<br>**T-31** (Penolakan CN melebihi barang diterima baik) |
| **SR-08**<br>Fleksibilitas Diskon vs Penguncian Dokumen | **Opsi A:** Sales bebas memberi diskon berapa pun<br>**Opsi B:** Diskon &le; 10% mandiri, &gt; 10% butuh approval Manajer, dokumen Confirmed terkunci | **Keputusan: Opsi B**<br>F-06, S-05 (Diskon & penguncian harga) | **Sales dirugikan:** Membutuhkan otorisasi manajer untuk promo besar. Mitigasi: Workflow dialog approval cepat di sistem. | **T-11** (Penguncian harga S00007)<br>**T-34** (Diskon 10% disetujui)<br>**T-35** (Diskon 15% ditahan) |
| **SR-10**<br>Eksposur Kredit Pelanggan | **Opsi A:** Pesanan kredit disetujui bebas demi omzet<br>**Opsi B:** Total eksposur tidak boleh melebihi Credit Limit; pelanggan TUNAI dilarang kredit | **Keputusan: Opsi B**<br>F-10, S-05 (Pemeriksaan Credit Limit) | **Pelanggan over-limit dirugikan:** Order tertahan sampai melunasi invoice lama. Mitigasi: Visualisasi modal credit exposure transparan. | **T-04** (Penolakan kredit C04 TUNAI)<br>**T-09** (C03 limit cukup)<br>**T-10** (Penolakan C02 over-limit) |

---

## 5. Rangkuman Pengujian Skenario T-01 s.d. T-36

Aplikasi menyediakan **Pusat Pengujian Interaktif (Test Runner)** yang dapat dijalankan secara instan dengan 1 klik atau satu per satu:

- **T-01 (Passed):** Login Sales menampilkan modul berwenang; tidak membuka jurnal.
- **T-02 (Passed):** Sales mengakses Jurnal -> Akses Ditolak (Access Denied) & tercatat di Audit Log.
- **T-03 (Passed):** Buka C02 -> Limit Rp400.000 dan NET14 terverifikasi.
- **T-04 (Passed):** C04 bertermin TUNAI mencoba kredit -> Ditolak (SR-10).
- **T-05 (Passed):** Varian `AP-TS-BLK-M` dan `AP-TS-BLK-L` terpisah dengan stok masing-masing 4 dan 0 unit.
- **T-06 (Passed):** Buat varian dengan SKU duplikat -> Ditolak oleh validasi keunikan SKU (SR-11).
- **T-07 (Passed):** Konversi LEAD-001 menjadi Opportunity -> Stage Qualified, riwayat asal terhubung.
- **T-08 (Passed):** Konversi ulang Opportunity -> Dokumen ganda dicegah, diarahkan ke quotation asli.
- **T-09 (Passed):** C03 order 2 Dress Denim M kredit -> Subtotal Rp900k, PPN Rp99k, Total Rp999k, reservasi 2 unit, limit cukup.
- **T-10 (Passed):** C02 konfirmasi order kredit Rp499.500 -> Ditolak karena melebihi limit Rp400k (SR-10).
- **T-11 (Passed):** Ubah harga S00007 setelah Confirmed -> Ditolak dan dokumen terkunci (SR-08).
- **T-12 (Passed):** Kirim 2 unit S00007 via WH-JKT -> Stok 4&rarr;2, backorder 1, HPP Rp160.000 terposting ke jurnal.
- **T-13 (Passed):** Validasi kirim 4 unit pada pesanan 3 -> Ditolak sistem (SR-04).
- **T-14 (Passed):** Cek stok baseline `AP-TS-BLK-M` di WH-JKT -> On Hand 4, Reserved 3 oleh S00007, Available 1.
- **T-15 (Passed):** Transfer 1 unit `AP-TS-BLK-L` dari STORE-BDG ke WH-JKT -> Stok STORE 2&rarr;1, WH 0&rarr;1, total perusahaan tetap 2 unit dan nilai persediaan tetap.
- **T-16 (Passed):** Buka PO00007 -> Subtotal Rp760k, PPN Rp83.600, Total Rp843.600, status Confirmed.
- **T-17 (Passed):** Ubah qty PO00007 dari 4 ke 7 tanpa revisi -> Ditolak dan diaudit (SR-08).
- **T-18 (Passed):** Terima 3 unit hoodie M lolos QA -> Stok WH bertambah 2&rarr;5, nilai persediaan +Rp570.000, remaining PO 1.
- **T-19 (Passed):** Petugas coba akui barang gagal inspeksi (rejected) -> Sistem memblokir pengakuan unit rusak (SR-06).
- **T-20 (Passed):** Invoice atas 2 unit terkirim S00007 -> Subtotal Rp300k, PPN Rp33k, Piutang Rp333k, sisa 1 belum dapat ditagih.
- **T-21 (Passed):** Coba menagih 3 unit saat baru terkirim 2 -> Ditolak sistem (SR-02).
- **T-22 (Passed):** Posting bill 3 hoodie M -> Subtotal Rp570k, PPN Masukan Rp62.700, Utang AP Rp632.700.
- **T-23 (Passed):** Coba posting bill 4 hoodie saat accepted hanya 3 -> Three-Way Matching menolak tagihan (SR-06).
- **T-24 (Passed):** Faktur Rp333k dibayar parsial Rp200k via Bank -> Sisa piutang Rp133k, status Partially Paid, Bank bertambah Rp200k.
- **T-25 (Passed):** Pelunasan sisa Rp133k -> Saldo sisa tepat nol, status beralih ke Paid, jurnal kedua tercatat seimbang.
- **T-26 (Passed):** Tinjau jurnal buku besar -> Total Debit == Total Kredit seimbang sempurna.
- **T-27 (Passed):** Posting ulang delivery yang telah Done -> Idempoten, jurnal ganda dicegah (SR-15).
- **T-28 (Passed):** POS jual 2 Scarf tunai @Rp120k -> Net sales Rp240k, PPN Rp26.400, Struk Rp266.400, stok toko 6&rarr;4, HPP Rp120k seimbang.
- **T-29 (Passed):** POS coba jual 3 Kaos L saat stok toko hanya 2 -> Ditolak dengan pesan Insufficient Stock, stok tidak negatif (SR-03, SR-04).
- **T-30 (Passed):** Retur 1 Kaos M diterima layak -> Stok WH 2&rarr;3, HPP dibalik Rp80k, Credit Note Rp166.500 diterbitkan, piutang berkurang.
- **T-31 (Passed):** Coba terbitkan Credit Note untuk 2 unit saat retur fisik diterima hanya 1 -> Ditolak sistem (SR-07).
- **T-32 (Passed):** Dashboard memfilter transaksi POS T-28 -> Net sales Rp240k, PPN Rp26.400, Gross Rp266.400, units sold 2.
- **T-33 (Passed):** Akun Cashier membuka dashboard -> Jurnal dan AR global perusahaan disembunyikan sesuai hak akses minimal (SR-16).
- **T-34 (Passed):** Quotation dengan diskon 10% -> Subtotal Rp810k, PPN Rp89.100, Total Rp899.100 (Diskon mandiri lolos).
- **T-35 (Passed):** Quotation dengan diskon 15% tanpa otorisasi Manajer -> Konfirmasi ditahan (SR-08).
- **T-36 (Passed):** Pelunasan utang Vendor Bill Rp632.700 via Bank -> AP menjadi Rp0, Bank berkurang Rp632.700, status Paid.

---

## 6. Jawaban Pertanyaan Refleksi (Handout Hal. 49)

### Refleksi 1: Konflik antar pemangku kepentingan mana yang paling sulit diselesaikan?
Konflik paling sengit terjadi antara **Nadya Kinasih (Manajer Penjualan - SR-01)** yang menuntut penagihan penuh sejak order disetujui demi percepatan arus kas, melawan **Fajar Pratama (Kepala Keuangan - SR-02)** yang melarang keras penagihan mendahului pengiriman barang nyata.

- **Nilai yang dikorbankan:** Kecepatan penagihan di muka oleh Sales dikorbankan demi kepatuhan pengakuan pendapatan dan perlindungan reputasi pelanggan.
- **Mitigasi:** Sistem menerapkan otomatisasi pengiriman bertahap dengan pelacakan *Backorder* (F-08), di mana penagihan dapat langsung diterbitkan secara instan begitu sebagian barang keluar dari gudang (F-09), tanpa harus menunggu seluruh order selesai.

### Refleksi 2: Pada bagian mana AI tool menghasilkan UI yang tampak benar tetapi melanggar aturan bisnis?
1. **Reservasi Stok (SR-04):** UI default AI kerap memotong `on_hand` begitu SO dikonfirmasi. Perbaikan: `on_hand` tetap utuh, hanya `reserved` yang bertambah dan `available` yang berkurang. Pemotongan fisik baru terjadi saat pengiriman tervalidasi.
2. **Three-Way Matching (SR-06):** AI sering langsung membuat Vendor Bill dari seluruh kuantitas PO. Perbaikan: Kuantitas tagihan wajib diverifikasi terhadap barang yang lolos inspeksi (`accepted_qty`), bukan barang yang rusak atau belum tiba.
3. **Idempotensi Transaksi (SR-15):** Tombol klik ganda pada pengiriman atau pembayaran rawan membuat mutasi ganda. Perbaikan: Status penguncian dokumen (`locked`/`done`) dan verifikasi keunikan referensi jurnal.

---

## 7. Rekomendasi Pengembangan Masa Depan (Now / Next / Later)

- **Performance (Now):** Optimasi caching client-side IndexedDB untuk riwayat ribuan mutasi stok toko retail.
- **Functions (Next):** Integrasi pemindaian barcode kamera untuk kasir POS dan serah terima gudang mobile.
- **Efficacy (Next):** Rekonsiliasi mutasi rekening bank otomatis via integrasi API Bank Mandiri/BCA.
- **Convenience (Later):** Modul Customer Loyalty Poin terpadu pada POS kasir retail (F-21) dan integrasi omnichannel e-commerce.
