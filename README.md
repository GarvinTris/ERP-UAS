# ERP-UAS
Project berfokus pada pembangunan Odo berbasis Web melalui Vibe Coding dari PT PT Rona Karsa Apparel  

## Cara Menjalankan

## Diagram Arsitektur dan Data

## Decision Log (Resolusi Konflik Stakeholder)

| No | Area Konflik | Pihak Berlawanan | Solusi Sistem (Decision Log) |
| :---: | :--- | :--- | :--- |
| **1** | Invoicing Sales | Sales (SR-01) vs Finance (SR-02) | Tentukan apakah sistem memakai *Delivered Quantities* sebagai default dan menyediakan *Invoice Down Payment* (DP). |
| **2** | Stok POS vs Gudang | Toko (SR-03) vs Gudang (SR-04) | Tetapkan aturan tegas: Stok Tidak Boleh Negatif (mencegah *miscount*) ATAU izinkan *backorder* khusus dengan *warning*. |
| **3** | Vendor Bill | Purchase (SR-05) vs Finance (SR-06) | *Vendor Bill* dibatasi oleh dokumen *Goods Receipt* (penerimaan fisik tervalidasi). |

## Test Results

## AI-tool usage note

## Role Assignment

| Nama / Anggota | Modul Utama | Daftar Fitur (F-xx) | Tanggung Jawab Utama | Bukti Kontribusi Wajib |
| :--- | :--- | :--- | :--- | :--- |
| **Anggota 1** | Sales / CRM, Co-owner Point of Sale | • F-02: Master kontak & termin kredit<br>• F-03: Master produk & SKU varian (kolaborasi)<br>• F-04: CRM Pipeline<br>• F-05: Quotation s.d. Sales Order<br>• F-06: Diskon & penguncian harga<br>• F-16: Point of Sale toko (co-owner)<br>• F-21: Loyalty sederhana (opsional) | • Analisis Stakeholder Rule (SR) & pemetaan rule-to-feature.<br>• Perancangan data/process model & Decision Log.<br>• Memimpin weekly checkpoint.<br>• Membangun & menguji modul Sales/CRM. | • Prioritas Fitur<br>• Decision Log<br>• Data/Process Model<br>• Hasil Pengujian T-07 s.d. T-11, T-34, T-35 |
| **Anggota 2** | Purchase / Inventory | • F-07: Reservasi & stok tersedia<br>• F-08: Pengiriman parsial & Backorder<br>• F-11: RFQ & Purchase Order<br>• F-12: Receipt & penerimaan layak<br>• F-18: Transfer lokasi terlacak | • Desain integrasi & review output AI coding tool.<br>• Membangun modul Purchase & Inventory.<br>• Mengelola repository Git.<br>• Pengujian mutasi stok dan reservasi. | • Architecture Note<br>• Merge History / Git Commit<br>• Hasil Pengujian T-12 s.d. T-19, T-30 stok |
| **Anggota 3** | Accounting / Invoicing, Co-owner Point of Sale | • F-01: Navigasi aplikasi & otorisasi<br>• F-09: Customer Invoice berbasis pengiriman<br>• F-10: Pemeriksaan credit limit<br>• F-13: Vendor Bill 3-way matching<br>• F-14: Posting buku besar & HPP<br>• F-15: Registrasi pembayaran parsial<br>• F-17: Retur barang & Credit Note<br>• F-19: Dashboard operasional<br>• F-20: Audit log & relasi dokumen | • Membangun antarmuka (UI) Accounting & POS.<br>• Review wireframe & pengujian silang (testing).<br>• Memuat data baseline seed.<br>• Deployment aplikasi ke server publik. | • Wireframe Checklist<br>• Test Report & Defect Log<br>• Deployed Link<br>• Hasil Pengujian T-01 s.d. T-04, T-20 s.d. T-29, T-31 s.d. T-33, T-36 |

## Team Assignment

## Tabel Contribution
