# Gabungan ERP-UAS (Supabase) + ERP-update (fitur baru)

Dasar: ERP-UAS. Seluruh tampilan/fitur dari ERP-update dipakai, lalu integrasi Supabase dipasang kembali.

## Dari ERP-update (dipakai penuh)
Semua modul di `src/components/modules/*`, `AddCustomerModal`, `ControlPanel`, `CreditValidationModal`,
`AppSwitcher`, `Sidebar`, `src/types/erp.ts`, `src/data/seedData.ts` (foto produk POS baru),
`vite.config.ts` (menyalin `src/assets` ke `dist` agar foto produk tampil di Vercel), `index.html`, `metadata.json`, `README.md`.

## Dari ERP-UAS (dipertahankan / dipasang ulang)
- `src/lib/supabaseClient.ts`, `src/lib/erpDatabase.ts`, `src/main.tsx`, `src/index.css`,
  `AnalyticsCharts`, `Chatter`, `SmartButtons`, `StatusBar` (masih dipakai modul baru).
- `package.json` + `package-lock.json` (dependency `@supabase/supabase-js`).
- `rona_karsa_supabase_auth_setup/`.

## Digabung manual
- `src/context/ERPContext.tsx`: kerangka ERP-update + (1) tanpa user default, (2) muat data dari Supabase setelah login,
  (3) autosave per-modul ke `erp_module_states`, (4) audit log ke `erp_audit_logs`, (5) logout memanggil `supabase.auth.signOut()`,
  (6) foto produk lama di cloud diisi dari seed.
- `src/components/auth/LoginPage.tsx`: login Supabase Auth (UAS) + panel pilih akun demo dari update (hanya mengisi email).

## Dihapus (memang tidak ada di ERP-update)
`TestSuiteModal`, `StoryboardModal`, test runner, simulasi peran (menu Simulasi Peran, switchRole), panel akun demo di login, dan fungsi attempt* (simulasi pelanggaran aturan).

## Setelah menimpa
1. `npm install`
2. Buat `.env.local` dari `.env.example`
3. Jalankan `supabase/verify_database.sql` di SQL Editor Supabase
4. `npm run lint && npm run build`
