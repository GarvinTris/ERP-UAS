-- Rona Karsa ERP: pemeriksaan database untuk frontend gabungan (read-only).
-- Jalankan di Supabase Dashboard > SQL Editor. Skrip ini TIDAK mengubah data.
-- Kirim hasil tiap bagian bila ada baris yang bermasalah.

-- 1) Kolom yang dibutuhkan frontend: hasil harus KOSONG (baris = kolom yang hilang)
with expected(tbl, col) as (values
  ('erp_module_states','module_name'),('erp_module_states','data'),
  ('erp_module_states','updated_at'),('erp_module_states','updated_by'),
  ('erp_audit_logs','log_id'),('erp_audit_logs','timestamp'),('erp_audit_logs','user'),
  ('erp_audit_logs','role'),('erp_audit_logs','action'),('erp_audit_logs','module'),
  ('erp_audit_logs','document_number'),('erp_audit_logs','previous_value'),
  ('erp_audit_logs','new_value'),('erp_audit_logs','description'),
  ('erp_audit_logs','result'),('erp_audit_logs','created_at'),('erp_audit_logs','created_by'),
  ('profiles','id'),('profiles','full_name'),('profiles','role')
)
select e.tbl, e.col as kolom_hilang
from expected e
left join information_schema.columns c
  on c.table_schema='public' and c.table_name=e.tbl and c.column_name=e.col
where c.column_name is null;

-- 2) Tipe kolom updated_by / created_by (frontend mengirim UUID Supabase Auth, bukan 'USR-01')
select table_name, column_name, data_type
from information_schema.columns
where table_schema='public'
  and ((table_name='erp_module_states' and column_name='updated_by')
    or (table_name='erp_audit_logs'   and column_name='created_by'));

-- 3) Upsert memakai onConflict:'module_name' -> harus ada unique/primary key pada module_name
select conrelid::regclass as tabel, conname, pg_get_constraintdef(oid) as definisi
from pg_constraint
where conrelid = 'public.erp_module_states'::regclass and contype in ('p','u');

-- 4) RLS aktif + daftar policy (pastikan peran yang menulis tiap modul memang diizinkan)
select c.relname as tabel, c.relrowsecurity as rls_aktif
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('erp_module_states','erp_audit_logs','profiles');

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname='public' and tablename in ('erp_module_states','erp_audit_logs','profiles')
order by tablename, cmd, policyname;

-- 5) Modul data yang dipakai frontend (19 kunci). Baris hasil = modul yang BELUM ada di cloud
--    (tidak error: frontend memakai data seed lalu menyimpannya saat ada perubahan).
with expected(m) as (values
  ('customers'),('vendors'),('products'),('stock'),('stockMoves'),('leads'),
  ('salesOrders'),('deliveryOrders'),('purchaseOrders'),('receipts'),('customerInvoices'),
  ('vendorBills'),('payments'),('posTransactions'),('returns'),('creditNotes'),
  ('transfers'),('accounts'),('journalEntries'))
select m as modul_belum_ada_di_cloud
from expected left join public.erp_module_states s on s.module_name = expected.m
where s.module_name is null;

-- 6) Produk di cloud yang belum punya imageUrl (frontend mengisinya dari seed saat dimuat)
select count(*) as produk_tanpa_imageurl
from public.erp_module_states s, jsonb_array_elements(s.data::jsonb) p
where s.module_name='products' and coalesce(p->>'imageUrl','')='';

-- 7) Akun Auth tanpa profil / peran tidak valid -> login akan ditolak
select u.email, p.role,
       case when p.id is null then 'TIDAK ADA PROFIL'
            when p.role not in ('owner','sales','warehouse','finance','cashier','procurement') then 'PERAN TIDAK VALID'
       end as masalah
from auth.users u left join public.profiles p on p.id = u.id
where p.id is null
   or p.role not in ('owner','sales','warehouse','finance','cashier','procurement');