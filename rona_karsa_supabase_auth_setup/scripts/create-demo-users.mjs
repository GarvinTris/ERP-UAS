import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.ERP_DEMO_TEMP_PASSWORD;

if (!url || !serviceKey || !password) {
  console.error("Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ERP_DEMO_TEMP_PASSWORD first.");
  process.exit(1);
}
if (password.length < 12) {
  console.error("Temporary password must be at least 12 characters.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accounts = [
  { id: "USR-01", name: "Arga Mahendra", email: "owner@ronakarsa.com", role: "owner", role_name: "Pemilik Usaha (Owner / Admin)" },
  { id: "USR-02", name: "Nadya Kinasih", email: "sales@ronakarsa.com", role: "sales", role_name: "Manajer Penjualan (Sales)" },
  { id: "USR-03", name: "Bayu Firmansyah", email: "warehouse@ronakarsa.com", role: "warehouse", role_name: "Kepala Gudang (Warehouse)" },
  { id: "USR-04", name: "Fajar Pratama", email: "finance@ronakarsa.com", role: "finance", role_name: "Kepala Keuangan (Finance)" },
  { id: "USR-05", name: "Salsa Widianti", email: "cashier@ronakarsa.com", role: "cashier", role_name: "Kepala Toko / Kasir (Cashier)" },
  { id: "USR-06", name: "Rizki Wardana", email: "procurement@ronakarsa.com", role: "procurement", role_name: "Manajer Pembelian (Procurement)" },
];

async function findAuthUserByEmail(email) {
  // Six demo accounts only; scan pages in case the project has many Auth users.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 1000) break;
  }
  return null;
}

for (const account of accounts) {
  let authUser = await findAuthUserByEmail(account.email);

  if (authUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: account.name, erp_role: account.role },
    });
    if (error) throw new Error(`${account.email}: ${error.message}`);
    authUser = data.user;
    console.log(`Updated Auth user: ${account.email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: account.name, erp_role: account.role },
    });
    if (error) throw new Error(`${account.email}: ${error.message}`);
    authUser = data.user;
    console.log(`Created Auth user: ${account.email}`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("erp_users")
    .update({ auth_user_id: authUser.id, active: true })
    .eq("id", account.id)
    .select("id,email,role,auth_user_id")
    .single();

  if (profileError) throw new Error(`Profile ${account.email}: ${profileError.message}`);
  console.log(`Linked profile: ${profile.email} (${profile.role})`);
}

console.log("\nDone. Six demo Auth users were created/updated and linked to public.erp_users.");
console.log("Keep the shared demo password private and rotate it after the demonstration.");
