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
Dalam pengembangan proyek ERP berbasis web PT Rona Karsa Apparel, tim memanfaatkan AI coding tools dengan Vibe coding untuk mempercepat proses pengembangan aplikasi.

| AI Tool | Tahap Penggunaan | Keterangan |
| :--- | :--- | :--- |
| **Emergent.sh** | Eksplorasi Awal | Digunakan untuk mencoba membangun aplikasi ERP berbasis web melalui prompt dan pendekatan Vibe Coding. Pengembangan tidak dilanjutkan karena keterbatasan limit penggunaan. |
| **Google Antigravity** | Eksplorasi Awal | Digunakan untuk mencoba proses pengembangan aplikasi dan implementasi kode berbantuan AI. Penggunaan tidak dilanjutkan karena keterbatasan limit. |
| **Google AI Studio** | Pengembangan Utama | Digunakan sebagai AI tool utama untuk membantu proses pembangunan, pengembangan fitur, penyempurnaan kode, dan debugging aplikasi ERP. |

## Role Assignment

| Anggota | Peran Fungsional | Kepemilikan Modul (Maks. 2) | Tanggung Jawab | Bukti Kontribusi | Kriteria Rubrik Dominan |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **Anggota 1** | Product Owner, Project Manager & Business Analyst | Sales / CRM, Co-owner Point of Sale | Analisis Stakeholder Rule (SR); prioritas fitur; pemetaan rule-to-feature; perancangan data/process model; penyelesaian konflik stakeholder melalui Decision Log; memimpin weekly checkpoint; membangun modul dan menjalankan pengujian. | Prioritas Fitur; Decision Log; Model Data; T-07 s.d. T-11; Review Konflik. | Resolusi konflik stakeholder; business rule; presentasi dan analisis kebutuhan. |
| **Anggota 2** | Lead AI Developer | Purchase / Inventory | Desain integrasi; review keluaran AI coding tool; membangun modul; mengelola repository Git; menguji mutasi stok dan reservasi. | Architecture Note; Merge History / Git Commit; T-12 s.d. T-19; T-30 (Stok). | Fungsionalitas dan integrasi; aturan stok; pengelolaan repository. |
| **Anggota 3** | UI/UX, QA & Deployment Lead | Accounting / Invoicing, Co-owner Point of Sale | Membangun antarmuka Accounting dan POS; review wireframe; pengujian silang (cross-testing); memuat data baseline seed; deployment aplikasi ke server publik. | Wireframe Checklist; Test Report; Defect Log; Deployed Link; T-20 s.d. T-33. | Kualitas UI/UX; pengujian dan kualitas sistem; deployment aplikasi. |

## Team Agreement
- Setiap anggota  bertanggung jawab terhadap modul dan fitur sesuai pembagian Role Assignment yang telah tertera di sini.
- Komunikasi dan koordinasi dilakukan melalui grup WhatsApp untuk membahas perkembangan, kendala, dan kebutuhan proyek serta meeting melalui Zooms untuk membahas lebih lanjut.
- Tim melakukan checkpoint secara berkala untuk memantau perkembangan proyek dan memastikan setiap tugas berjalan sesuai rencana.
- Setiap perubahan kode harus dikelola melalui repository GitHub dengan riwayat kontribusi yang jelas.
- Implementasi fitur harus mengikuti requirement dan Stakeholder Rules (SR).
- AI coding tools diperbolehkan sebagai alat bantu pengembangan. Setiap hasil yang dihasilkan AI wajib ditinjau, disesuaikan, dan divalidasi oleh anggota tim.
- Setiap modul wajib menjalani pengujian fungsional sebelum dinyatakan selesai. Pengujian silang dilakukan untuk memastikan integrasi antarmodul berjalan dengan baik.
- Setiap anggota wajib menyediakan bukti kontribusi berupa dokumentasi, Git commit, hasil pengujian, atau artefak pekerjaan yang relevan.

## Tabel Contribution
