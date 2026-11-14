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

## 2. Tautan Penting
### 2.1
(App Maintainence)
### 2.2 Video Demo
https://youtu.be/Y2ya9xjc-BA?si=JZ-UyldUdpYbGV76
### 2.3 Presentasi
https://canva.link/fvkc86emy5kr8yw

---

## 3. Cara Menjalankan Aplikasi

### 3.1 Prasyarat

Hapus lockfile atau `node_modules` yang belum lengkap (jika ada):

```bash
rm -rf node_modules package-lock.json
```

### 3.2 Instalasi

```bash
npm install --legacy-peer-deps
```

### 3.3 Konfigurasi Environment

```bash
-
```

### 3.4 Load Seed Data & Reset Baseline



### 3.5 Menjalankan Aplikasi

Jalan kan di terminal 

npm run dev

Setelah server Vite aktif, buka browser dan akses:

http://localhost:3000

Aplikasi dapat digunakan secara lokal melalui browser.

### 3.6 Deployment

Vercel

```text
(Link Deployment)
```

---

## 4. Akun Uji Demo Sesuai Role (RBAC)

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

## 5. Arsitektur & Model Data
-
### 5.1 Diagram Arsitektur
-
### 5.2 Diagram Data (ERD)
(Gambar ERD Diagram)
### 5.3 Architecture Note
-
---

## 6. Cakupan 16 Kelompok Layar (S-01 s/d S-16)

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

### 6.1 Wireframe Checklist

---

## 7. Analisis Kebutuhan & Pemetaan Fitur

### 7.1 Klasifikasi Kebutuhan Pemangku Kepentingan (SR-01 s.d. SR-16)

**Kebijakan Bisnis:** SR-01, SR-02, SR-05, SR-06, SR-08, SR-10
**Permasalahan Kuantitas Stock:** SR-03, SR-04, SR-07, SR-11, SR-12
**Monitoring, Transparansi & Jejak Audit:** SR-09, SR-13, SR-14, SR-15, SR-16

### 7.2 Identifikasi Area Konflik

| No | Area Konflik | Pihak Berlawanan | Keputusan Sistem |
|---|---|---|---|
| 1 | Invoicing Sales | Sales (SR-01) vs Finance (SR-02) | Invoice berdasarkan kuantitas terkirim (lihat Bagian 8) |
| 2 | Stok POS vs Gudang | Toko (SR-03) vs Gudang (SR-04) | Stok tidak boleh negatif (lihat Bagian 8) |
| 3 | Vendor Bill | Purchase (SR-05) vs Finance (SR-06) | Bill dibatasi kuantitas diterima dan lolos QA (lihat Bagian 8) |

### 7.3 Rule to Feature

| SR | Pemangku Kepentingan | Ketentuan | Fitur Terkait | Prioritas |
|---|---|---|---|---|
| SR-01 | Nadya Kinasih (Sales) | Penagihan cepat setelah SO dikonfirmasi | F-05 | Must |
| SR-02 | Fajar Pratama (Finance) | Tagihan hanya untuk barang terkirim dan belum ditagih | F-09 | Must |
| SR-03 | Salsa Widianti (Store) | Transaksi POS tidak terhenti saat stok komputer kosong | F-16 | Must |
| SR-04 | Bayu Firmansyah (Warehouse) | Stok tidak negatif; reservasi mengurangi available; POS hanya mengurangi stok toko | F-07, F-08, F-16 | Must |
| SR-05 | Rizki Wardana (Purchase) | Vendor Bill sebesar seluruh kuantitas PO | F-11 | Must |
| SR-06 | Fajar Pratama (Finance) | Bill dibatasi kuantitas diterima baik (lolos QC) | F-12, F-13 | Must |
| SR-07 | Bayu Firmansyah (Warehouse) | Retur menambah stok hanya setelah fisik dicek; Credit Note sesuai retur tervalidasi | F-08, F-17 | Must |
| SR-08 | Nadya Kinasih (Sales) | Diskon ≤ 10% diizinkan; di atasnya butuh approval Manajer; dokumen Confirmed terkunci | F-05, F-06 | Must |
| SR-09 | Salsa Widianti (Store) | POS memicu penjualan, PPN keluaran, HPP, dan stok dalam satu transaksi | F-14, F-16 | Must |
| SR-10 | Fajar Pratama (Finance) | Piutang terbuka + nilai bruto order baru ≤ credit limit; pelanggan TUNAI tanpa kredit | F-02, F-10 | Must |
| SR-11 | Bayu Firmansyah (Warehouse) | Setiap kombinasi ukuran-warna punya SKU unik | F-03, F-07 | Must |
| SR-12 | Rizki Wardana (Purchase) | Transfer antar lokasi tidak mengubah stok total dan nilai persediaan | F-18 | Should |
| SR-13 | Fajar Pratama (Finance) | Pembayaran parsial mengurangi saldo; Paid hanya jika saldo nol | F-15 | Must |
| SR-14 | Arga Mahendra (Owner) | Dashboard terpisah (sebelum PPN, PPN, unit, saldo, persediaan) dan dapat ditelusuri | F-19, F-21 (opsional) | Should |
| SR-15 | Arga Mahendra (Owner) | Nomor dokumen unik; posting, retur, pembayaran, mutasi stok idempoten | F-04, F-14, F-20 | Must |
| SR-16 | Arga Mahendra (Owner) | Hak akses minimal per peran; perubahan tercatat di audit log | F-01, F-20 | Must |

### 7.4 Prioritas Fitur dan Rencana Pengerjaan

| No | Kode | Fitur | Prioritas | Rencana Pengerjaan | Alasan |
|---|---|---|---|---|---|
| 1 | F-03 | Master produk dan SKU varian | Prioritas 1 (Core Bisnis) | 24–25 Okt 2026 | Fondasi katalog agar penjualan dan POS berjalan |
| 2 | F-02 | Master kontak dan termin kredit | Prioritas 1 | 26–27 Okt 2026 | Basis pelanggan/vendor, batas kredit, termin |
| 3 | F-04 | CRM Pipeline | Prioritas 1 | 28–29 Okt 2026 | Lead sampai Opportunity |
| 4 | F-05 | Quotation sampai Sales Order | Prioritas 1 | 30–31 Okt 2026 | Transaksi penjualan utama |
| 5 | F-06 | Diskon dan penguncian harga | Prioritas 1 | 1–2 Nov 2026 | Otorisasi diskon dan penguncian order Confirmed |
| 6 | F-07 | Reservasi dan stok tersedia | Prioritas 1 | 2–3 Nov 2026 | Mencegah stok negatif |
| 7 | F-09 | Customer Invoice berbasis pengiriman | Prioritas 1 | 3–4 Nov 2026 | Faktur akurat sesuai pengiriman fisik |
| 8 | F-16 | Point of Sale untuk toko | Prioritas 1 | 4–5 Nov 2026 | Kasir real-time, stok dan omzet |
| 9 | F-17 | Retur barang dan Credit Note | Prioritas 1 | 5–6 Nov 2026 | Retur, pengembalian persediaan, nota kredit |
| 10 | F-08 | Pengiriman parsial dan Backorder | Prioritas 2 (Operasional) | 6–7 Nov 2026 | Sisa pengiriman dan HPP |
| 11 | F-10 | Pemeriksaan credit limit | Prioritas 2 | 7–8 Nov 2026 | Blokir order melebihi limit |
| 12 | F-11 | RFQ dan Purchase Order | Prioritas 2 | 8–9 Nov 2026 | Pengadaan dari vendor |
| 13 | F-12 | Receipt dan penerimaan diterima baik | Prioritas 2 | 9–10 Nov 2026 | Penerimaan fisik dan stok layak jual |
| 14 | F-13 | Vendor Bill dengan pencocokan 3 arah | Prioritas 2 | 10–11 Nov 2026 | PO, receipt, dan bill |
| 15 | F-18 | Transfer lokasi terlacak | Prioritas 3 (Integrasi Sampingan) | 11–12 Nov 2026 | Pindah stok tanpa ubah total |
| 16 | F-14 | Posting buku besar dan HPP | Prioritas 3 | 12 Nov 2026 | Jurnal otomatis dan HPP |
| 17 | F-15 | Registrasi pembayaran parsial | Prioritas 3 | 12 Nov 2026 | Pembayaran bertahap sampai lunas |
| 18 | F-01 | Navigasi aplikasi dan otorisasi | Prioritas 4 (Sistem & Akses) | 13 Nov 2026 | Hak akses per peran |
| 19 | F-19 | Dashboard operasional | Prioritas 5 (Audit & Review) | 13–14 Nov 2026 | KPI operasional |
| 20 | F-20 | Audit log dan relasi dokumen | Prioritas 5 | 14 Nov 2026 | Riwayat aktivitas dan tautan dokumen |
| 21 | F-21 | Loyalty sederhana toko | Opsional | Ditunda / ditiadakan | Fitur tambahan non-kritis |

### 7.5 Peta Cakupan Modul dan Pengujian

| Modul | Fitur | Pengujian |
|---|---|---|
| CRM & Sales | F-04, F-05, F-06 | T-07 s.d. T-11, T-34, T-35 |
| Inventory & Procurement | F-03, F-07, F-08, F-11, F-12, F-18 | T-05, T-06, T-12 s.d. T-19 |
| Accounting & Invoicing | F-02, F-09, F-10, F-13, F-14, F-15, F-17 | T-03, T-04, T-20 s.d. T-27, T-30, T-31, T-36 |
| Point of Sale (co-owned) | F-16, F-21 | T-28, T-29 |
| System & Dashboard | F-01, F-19, F-20 | T-01, T-02, T-32, T-33 |

---

## 8. Decision Defense

| Masalah/Konflik SR | Opsi Dipertimbangkan | Keputusan + F/S | Trade-Off / Siapa Dirugikan | Bukti Pengujian |
|---|---|---|---|---|
| **SR-01 vs SR-02**<br>Penagihan SO vs Pengiriman Nyata | **Opsi A:** Invoice langsung saat SO disetujui (Sales)<br>**Opsi B:** Invoice hanya terbit untuk kuantitas terkirim (Finance) | **Keputusan: Opsi B**<br>F-09, S-10 (Customer Invoice berbasis pengiriman) | **Sales dirugikan:** Tidak bisa menagih uang muka di awal tanpa pengiriman. Mitigasi: Koordinasi pengiriman parsial dan backorder cepat. | **T-20** (Invoice 2 unit dari 3 terkirim)<br>**T-21** (Penolakan invoice 3 unit) |
| **SR-03 vs SR-04**<br>Penjualan POS vs Integritas Stok Fisik | **Opsi A:** Kasir boleh menjual walau komputer kosong (Toko)<br>**Opsi B:** Stok tidak boleh negatif, transaksi ditolak jika stok kurang (Gudang) | **Keputusan: Opsi B**<br>F-16, S-14 (Validasi stok toko STORE-BDG sebelum bayar) | **Kasir dirugikan:** Potensi kehilangan pembeli jika barang belum diinput. Mitigasi: Internal Transfer instan dari WH-JKT. | **T-28** (POS sukses stok cukup)<br>**T-29** (Penolakan POS stok kurang) |
| **SR-05 vs SR-06**<br>Vendor Bill saat PO vs Three-Way Matching | **Opsi A:** Vendor bill dibukukan saat PO disetujui (Pembelian)<br>**Opsi B:** Vendor bill dibatasi barang lolos QA (Finance) | **Keputusan: Opsi B**<br>F-13, S-11 (Three-Way Matching ketat) | **Vendor dirugikan:** Menunggu inspeksi QA sebelum pembayaran disetujui. Mitigasi: Akun transitori GRNI 1210 pada penerimaan. | **T-18** (Receipt 3 unit lolos QA)<br>**T-22** (Bill 3 unit)<br>**T-23** (Penolakan bill 4 unit) |
| **SR-07**<br>Retur Pelanggan & Pemulihan Persediaan | **Opsi A:** Retur langsung menambah stok & Credit Note di kasir<br>**Opsi B:** Retur wajib inspeksi gudang; hanya unit layak restock yang dibalikkan HPP & berhak Credit Note | **Keputusan: Opsi B**<br>F-17, S-15 (Customer Returns & Credit Note) | **Pelanggan dirugikan:** Menunggu verifikasi fisik barang. Mitigasi: Pencatatan inspeksi transparan dan pembalikan HPP otomatis. | **T-30** (Retur 1 unit layak restock, HPP dibalik)<br>**T-31** (Penolakan CN melebihi barang diterima baik) |
| **SR-08**<br>Fleksibilitas Diskon vs Penguncian Dokumen | **Opsi A:** Sales bebas memberi diskon berapa pun<br>**Opsi B:** Diskon &le; 10% mandiri, &gt; 10% butuh approval Manajer, dokumen Confirmed terkunci | **Keputusan: Opsi B**<br>F-06, S-05 (Diskon & penguncian harga) | **Sales dirugikan:** Membutuhkan otorisasi manajer untuk promo besar. Mitigasi: Workflow dialog approval cepat di sistem. | **T-11** (Penguncian harga S00007)<br>**T-34** (Diskon 10% disetujui)<br>**T-35** (Diskon 15% ditahan) |
| **SR-10**<br>Eksposur Kredit Pelanggan | **Opsi A:** Pesanan kredit disetujui bebas demi omzet<br>**Opsi B:** Total eksposur tidak boleh melebihi Credit Limit; pelanggan TUNAI dilarang kredit | **Keputusan: Opsi B**<br>F-10, S-05 (Pemeriksaan Credit Limit) | **Pelanggan over-limit dirugikan:** Order tertahan sampai melunasi invoice lama. Mitigasi: Visualisasi modal credit exposure transparan. | **T-04** (Penolakan kredit C04 TUNAI)<br>**T-09** (C03 limit cukup)<br>**T-10** (Penolakan C02 over-limit) |

---

## 9. Test Results T-01 s.d. T-36

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

### 9.1 Tabel Hasil Pengujian (Expected vs Actual, Status, Bukti)
-
### 9.2 Catatan Fixture & Baseline Seed
-
### 9.3 Defect Log
-
---

## 10. Tim & Kolaborasi

### 10.1 Role Assignment Sheet

| No | Nama Mahasiswa | NIM | Anggota | Peran Fungsional | Modul / Area yang Dimiliki | Fokus Pekerjaan |
|---|---|---|---|---|---|---|
| 1 | Garvin Triskie | ... | Anggota 1 | Product Owner, Project Manager & Business Analyst | Sales / CRM, co-owner Point of Sale | Dokumentasi GitHub, analisa SR, analisa business rule, memastikan aplikasi berjalan lancar, review UI/UX dan tombol testing |
| 2 | Mikha Sula | ... | Anggota 2 | Lead AI Developer | Database, arsitektur | Database Supabase, ERD, diagram arsitektur, integrasi Supabase ke frontend |
| 3 | Naura Syafira | ... | Anggota 3 | UI/UX, QA & Deployment Lead | Accounting / Invoicing, co-owner Point of Sale | Frontend UI/UX, pengujian semua fitur terhadap SR, perbaikan hasil temuan |

### 10.2 Team Agreement

| No | Topik | Kesepakatan |
|---|---|---|
| 1 | Jadwal rapat | Rapat dilakukan dengan mencari waktu yang cocok bersama. Karena anggota lain sibuk, koordinasi lebih banyak lewat chat daripada rapat tatap muka. |
| 2 | Prosedur persetujuan keputusan | Belum ada prosedur formal. Keputusan teknis dan bisnis dikonsultasikan ke Garvin (Anggota 1) sebagai Product Owner. |
| 3 | Jika ada anggota terlambat | Tidak ada sanksi atau mekanisme khusus. Tiap anggota mengerjakan bagiannya sendiri dan menyerahkan hasil sesuai tenggat yang diminta Garvin. |
| 4 | Pembagian kerja di GitHub (branch, commit, merge) | Anggota lain mengerjakan bagiannya di luar repository dan mengirim hasilnya lewat WhatsApp ke Garvin, lalu Garvin yang memasukkannya ke GitHub. Branch dan merge antar anggota belum dipakai. |
| 5 | Media komunikasi | WhatsApp (chat) |

### 10.3 Tabel Kontribusi

| Anggota | Role | Modul / Area | F-xx yang Dibangun | T-xx yang Diuji | Kontribusi Aktual | Commit Penting |
|---|---|---|---|---|---|---|
| Garvin Triskie (Anggota 1) | PO / PM / BA | Sales / CRM, co-owner POS | F-02, F-03 (kolaborasi), F-04, F-05, F-06, F-16 (co-owner), F-21 (opsional, ditunda) | T-07 s.d. T-11, T-34, T-35 | Dokumentasi GitHub, analisa SR dan business rule (Decision Log, rule-to-feature, prioritas fitur), memastikan aplikasi berjalan lancar, review UI/UX dan tombol testing, meminta perbaikan ke Naura (3 kali) | ... |
| Mikha Sula (Anggota 2) | Lead AI Developer | Database, arsitektur (rencana awal: Purchase / Inventory) | F-07, F-08, F-11, F-12, F-18 (rencana awal; kini sebagai fondasi database) | T-12 s.d. T-19, T-30 | Database Supabase, ERD (ongoing), diagram arsitektur, integrasi Supabase ke frontend | ... |
| Naura Syafira (Anggota 3) | UI/UX, QA & Deployment Lead | Frontend semua modul, co-owner POS (rencana awal: Accounting / Invoicing) | F-01, F-09, F-10, F-13, F-14, F-15, F-17, F-19, F-20 | T-01 s.d. T-04, T-20 s.d. T-29, T-31 s.d. T-33, T-36 | Frontend UI/UX, pengujian fitur terhadap SR, perbaikan hasil temuan | ... |

Catatan: hasil kerja Mikha dan Naura diserahkan lewat WhatsApp, lalu di-commit ke GitHub oleh Garvin. Perubahan dari rencana awal dicatat di 10.4.

### 10.4 Riwayat Perubahan Kepemilikan/Peran

| No | Tahap | Tanggal | Pihak | Perubahan / Aktivitas | Alasan / Hasil |
|---|---|---|---|---|---|
| 1 | Awal pembangunan | ... | Naura Syafira | Membangun frontend UI/UX dan mencari desain yang cocok | Menentukan tampilan aplikasi |
| 2 | Pengujian awal | ... | Naura Syafira → Garvin Triskie | Naura menguji lalu menyerahkan hasil ke Garvin | Garvin mengecek dan meminta perbaikan |
| 3 | Perbaikan 1 | ... | Naura Syafira | Tombol testing otomatis diganti pengujian manual | Pengujian harus dijalankan sendiri dengan bukti, bukan diasumsikan lulus |
| 4 | Perbaikan 2 | ... | Naura Syafira | Memperbaiki input yang tidak tepat (nilai Rp100.000 berubah menjadi Rp33.000) | Nilai input harus sesuai angka yang dimasukkan |
| 5 | Perbaikan 3 | ... | Naura Syafira | Membatasi satu user hanya ke satu peran | Sesuai SR-16 (hak akses minimal per peran) |
| 6 | Pembangunan database | ... | Mikha Sula | Membangun database Supabase, ERD (ongoing), dan integrasi Supabase ke frontend | Data persisten dan siap deploy via Vercel + Supabase |

---

## 11. AI-Tool Usage Note

### 11.1 Daftar Tool yang Digunakan
AI Studio, Emergent SH, Claude
### 11.2 Contoh Output AI yang Salah dan Perbaikannya

---

## 12. Jawaban Pertanyaan Refleksi

### 12.1 Refleksi 1: Konflik antar pemangku kepentingan mana yang paling sulit diselesaikan?
Konflik paling sengit terjadi antara **Nadya Kinasih (Manajer Penjualan - SR-01)** yang menuntut penagihan penuh sejak order disetujui demi percepatan arus kas, melawan **Fajar Pratama (Kepala Keuangan - SR-02)** yang melarang keras penagihan mendahului pengiriman barang nyata.

- **Nilai yang dikorbankan:** Kecepatan penagihan di muka oleh Sales dikorbankan demi kepatuhan pengakuan pendapatan dan perlindungan reputasi pelanggan.
- **Mitigasi:** Sistem menerapkan otomatisasi pengiriman bertahap dengan pelacakan *Backorder* (F-08), di mana penagihan dapat langsung diterbitkan secara instan begitu sebagian barang keluar dari gudang (F-09), tanpa harus menunggu seluruh order selesai.

### 12.2 Refleksi 2: Pada bagian mana AI tool menghasilkan UI yang tampak benar tetapi melanggar aturan bisnis?
1. **Reservasi Stok (SR-04):** UI default AI kerap memotong `on_hand` begitu SO dikonfirmasi. Perbaikan: `on_hand` tetap utuh, hanya `reserved` yang bertambah dan `available` yang berkurang. Pemotongan fisik baru terjadi saat pengiriman tervalidasi.
2. **Three-Way Matching (SR-06):** AI sering langsung membuat Vendor Bill dari seluruh kuantitas PO. Perbaikan: Kuantitas tagihan wajib diverifikasi terhadap barang yang lolos inspeksi (`accepted_qty`), bukan barang yang rusak atau belum tiba.
3. **Idempotensi Transaksi (SR-15):** Tombol klik ganda pada pengiriman atau pembayaran rawan membuat mutasi ganda. Perbaikan: Status penguncian dokumen (`locked`/`done`) dan verifikasi keunikan referensi jurnal.

---

## 13. Rekomendasi Pengembangan Masa Depan (Now / Next / Later)

- **Performance (Now):** Optimasi caching client-side IndexedDB untuk riwayat ribuan mutasi stok toko retail.
- **Functions (Next):** Integrasi pemindaian barcode kamera untuk kasir POS dan serah terima gudang mobile.
- **Efficacy (Next):** Rekonsiliasi mutasi rekening bank otomatis via integrasi API Bank Mandiri/BCA.
- **Convenience (Later):** Modul Customer Loyalty Poin terpadu pada POS kasir retail (F-21) dan integrasi omnichannel e-commerce.

---

## 14. Integritas Akademik & Orisinalitas Kode

### 14.1 Pernyataan Orisinalitas
Kami menyatakan bahwa aplikasi ERP PT Rona Karsa Apparel ini dibangun oleh kelompok kami sendiri. Kami tidak menyalin kode sumber maupun aset (logo, ikon, gambar, stylesheet) dari Odoo. Odoo Web 17.0 hanya dijadikan acuan struktur dan pengalaman pengguna (app switcher, tampilan List/Kanban/Form, status bar, smart button), sesuai ketentuan handout.

### 14.2 Kolaborasi
Kolaborasi dilakukan di dalam kelompok (Garvin Triskie, Mikha Sula, Naura Syafira). Kami tidak membagikan atau menerima kode, prompt, maupun solusi dari kelompok lain. Diskusi dengan kelompok lain, jika ada, terbatas pada konsep.

### 14.3 Penggunaan AI
Pembangunan fitur dibantu AI coding tool. Seluruh tool yang digunakan diungkapkan di Bagian 11. Hasil keluaran AI kami tinjau dan uji terhadap aturan bisnis SR-xx; kesalahan yang ditemukan dicatat di Bagian 9.3 (Defect Log) dan 11.2.

### 14.4 Pemahaman Anggota
Setiap anggota bersedia menjelaskan seluruh bagian aplikasi, Decision Log, dan keputusan lintas modul secara langsung saat presentasi dan tanya jawab, termasuk modul yang tidak dikerjakannya.

### 14.5 Referensi
- Handout Skenario Mahasiswa — PT Rona Karsa Apparel (Fashion & Apparel)
- DJP, PMK 131/2024 (pajak.go.id/node/113453) — asumsi PPN efektif 11%
- Odoo 17.0 Documentation: Invoicing Policies dan Automatic Inventory Valuation

### 14.6 Catatan Data
Semua nama perusahaan, tokoh, dan data transaksi bersifat fiktif dan hanya untuk pembelajaran. Simulasi perpajakan tidak menggantikan proses perpajakan riil.
