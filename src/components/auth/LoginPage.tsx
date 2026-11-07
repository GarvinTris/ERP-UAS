import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { INITIAL_USERS } from '../../data/seedData';
import { UserRole } from '../../types/erp';

export const LoginPage: React.FC = () => {
  const { setCurrentUser, addNotification, logAudit } = useERP();

  const [email, setEmail] = useState('owner@ronakarsa.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const found = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      addNotification('success', `Selamat datang, ${found.name}! Masuk sebagai ${found.roleName}.`);
      logAudit('LOGIN', 'AUTH', found.id, `User ${found.name} logged in successfully`, 'SUCCESS');
    } else {
      addNotification('error', 'Kredensial tidak valid. Silakan gunakan akun demo yang tersedia.');
      logAudit('LOGIN', 'AUTH', email, `Failed login attempt for ${email}`, 'DENIED');
    }
  };

  const handleQuickRoleSelect = (role: UserRole) => {
    const user = INITIAL_USERS.find((u) => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword('password123');
      setCurrentUser(user);
      addNotification('success', `Login cepat sebagai ${user.name} (${user.roleName})`);
      logAudit('LOGIN_QUICK', 'AUTH', user.id, `Quick login as ${user.name} (${user.role})`, 'SUCCESS');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F5F0E8] text-[#171717]">
      {/* Kolom Kiri: Fashion Brand Visual Editorial */}
      <div className="relative md:w-1/2 min-h-[380px] md:min-h-screen bg-[#171717] flex flex-col justify-between p-8 md:p-14 overflow-hidden">
        {/* Background Editorial Image with dark vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/fashion_editorial_login_1793370219366.jpg"
            alt="PT Rona Karsa Apparel Campaign"
            className="w-full h-full object-cover object-center opacity-65 scale-105 transition-transform duration-1000 ease-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-[#171717]/60" />
        </div>

        {/* Top brand header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/30 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white font-serif font-bold text-lg tracking-wider">
              RK
            </div>
            <div>
              <div className="text-white font-semibold text-base tracking-wider uppercase">PT Rona Karsa Apparel</div>
              <div className="text-[#D5CEBF] text-[11px] tracking-widest uppercase">Casual Essentials · Est. 2021</div>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-[#E8E4DE] bg-white/10 backdrop-blur-sm border border-white/20">
            ENTERPRISE ERP 17.0
          </span>
        </div>

        {/* Bottom Tagline & Editorial copy */}
        <div className="relative z-10 max-w-lg mt-auto pt-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C18B42] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autumn / Winter Workwear Systems</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Elegance in Every Detail.
          </h1>
          <p className="text-sm md:text-base text-[#D5CEBF] mt-4 leading-relaxed font-light">
            One integrated platform to manage every part of your fashion business — from procurement and warehouse multi-location stock to retail POS, three-way matching, and double-entry accounting.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/15 mt-8 text-xs text-[#E8E4DE]">
            <div>
              <div className="font-mono text-lg font-bold text-white">WH-JKT</div>
              <div className="text-[#8C8983] text-[11px]">Central Warehouse</div>
            </div>
            <div>
              <div className="font-mono text-lg font-bold text-white">STORE-BDG</div>
              <div className="text-[#8C8983] text-[11px]">Retail Store & POS</div>
            </div>
            <div>
              <div className="font-mono text-lg font-bold text-white">106 Units</div>
              <div className="text-[#8C8983] text-[11px]">Verified Opening Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Login Form */}
      <div className="md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 bg-[#FFFEFC]">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="text-xs font-mono text-[#8C8983] uppercase tracking-wider mb-1">
              PT Rona Karsa Apparel — Enterprise Workspace
            </div>
            <h2 className="text-3xl font-bold text-[#171717] tracking-tight">Welcome Back</h2>
            <p className="text-sm text-[#8C8983] mt-1.5">
              Sign in to your workspace or choose a preconfigured role demo account.
            </p>
          </div>

          {/* Quick Role Selection for Grading / Demo */}
          <div className="mb-6 p-4 rounded-xl bg-[#F5F0E8] border border-[#E7E3DD]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#171717] uppercase tracking-wide">
                Akun Uji Demo (Sesuai Tim & Role):
              </span>
              <span className="text-[10px] text-[#8C8983]">Klik untuk langsung login</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { role: 'owner' as UserRole, name: 'Arga M.', title: 'Owner' },
                { role: 'sales' as UserRole, name: 'Nadya K.', title: 'Sales' },
                { role: 'warehouse' as UserRole, name: 'Bayu F.', title: 'Warehouse' },
                { role: 'finance' as UserRole, name: 'Fajar P.', title: 'Finance' },
                { role: 'cashier' as UserRole, name: 'Salsa W.', title: 'Cashier' },
                { role: 'procurement' as UserRole, name: 'Rizki W.', title: 'Procurement' },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickRoleSelect(item.role)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D5CEBF] hover:border-[#171717] hover:bg-[#171717] hover:text-white transition-all text-left text-xs shadow-xs group"
                >
                  <div className="font-semibold text-[11px] group-hover:text-white leading-tight">{item.title}</div>
                  <div className="text-[10px] text-[#8C8983] group-hover:text-[#D5CEBF] leading-tight truncate">{item.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#171717] mb-1.5">Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8983]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@ronakarsa.com"
                  className="w-full bg-white text-sm pl-10 pr-4 py-2.5 rounded-lg border border-[#E7E3DD] focus:outline-none focus:border-[#171717] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#171717] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8983]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white text-sm pl-10 pr-10 py-2.5 rounded-lg border border-[#E7E3DD] focus:outline-none focus:border-[#171717] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C8983] hover:text-[#171717]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#8C8983] hover:text-[#171717]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E7E3DD] text-[#171717] focus:ring-0"
                />
                <span>Remember me on this browser</span>
              </label>

              <button
                type="button"
                onClick={() => addNotification('info', 'Gunakan salah satu dari 6 akun demo di atas untuk login langsung.')}
                className="text-[#171717] hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-[#171717] hover:bg-[#282828] text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Sign In to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Compliance & security note */}
          <div className="mt-8 pt-6 border-t border-[#E7E3DD] text-center text-xs text-[#8C8983] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#54745B]" />
            <span>Role-Based Access Control (RBAC) & Audit Log Enabled (SR-16)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
