import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { useERP } from '../../context/ERPContext';
import { INITIAL_USERS } from '../../data/seedData';
import { UserRole } from '../../types/erp';
import { supabase } from '../../lib/supabaseClient';

export const LoginPage: React.FC = () => {
  const { setCurrentUser, addNotification, logAudit } = useERP();

  const [email, setEmail] = useState('owner@ronakarsa.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      // 1. Login menggunakan Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        addNotification(
          'error',
          error?.message || 'Email atau password tidak valid.'
        );

        logAudit(
          'LOGIN',
          'AUTH',
          email,
          'Login gagal',
          'DENIED'
        );

        return;
      }

      // 2. Ambil profil berdasarkan ID user Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();

        addNotification(
          'error',
          'Profil pengguna tidak ditemukan. Hubungi administrator.'
        );

        return;
      }

      // 3. Validasi role
      const validRoles: UserRole[] = [
        'owner',
        'sales',
        'warehouse',
        'finance',
        'cashier',
        'procurement',
      ];

      if (!validRoles.includes(profile.role as UserRole)) {
        await supabase.auth.signOut();

        addNotification('error', 'Role pengguna tidak valid.');

        return;
      }

      // 4. Ambil template struktur user berdasarkan role
      const roleTemplate = INITIAL_USERS.find(
        (user) => user.role === profile.role
      );

      if (!roleTemplate) {
        await supabase.auth.signOut();

        addNotification(
          'error',
          'Template role tidak ditemukan.'
        );

        return;
      }

      // 5. Buat user dari identitas Supabase
      const loggedInUser = {
        ...roleTemplate,
        id: data.user.id,
        email: data.user.email || email.trim(),
        name: profile.full_name || data.user.email || 'User',
        role: profile.role as UserRole,
      };

      // 6. Simpan user ke ERP Context
      setCurrentUser(loggedInUser);

      addNotification(
        'success',
        `Selamat datang, ${loggedInUser.name}! Masuk sebagai ${loggedInUser.roleName}.`
      );

      logAudit(
        'LOGIN',
        'AUTH',
        loggedInUser.id,
        `User ${loggedInUser.name} berhasil login`,
        'SUCCESS'
      );
    } catch (err) {
      console.error('Login error:', err);

      addNotification(
        'error',
        'Terjadi kesalahan saat login. Silakan coba lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F5F0E8] text-[#171717]">

      {/* Kolom Kiri */}
      <div className="relative md:w-1/2 min-h-[380px] md:min-h-screen bg-[#171717] flex flex-col justify-between p-8 md:p-14 overflow-hidden">

        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/fashion_editorial_login_1793370219366.jpg"
            alt="PT Rona Karsa Apparel Campaign"
            className="w-full h-full object-cover object-center opacity-65 scale-105 transition-transform duration-1000 ease-out"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-[#171717]/60" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/30 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white font-serif font-bold text-lg tracking-wider">
              RK
            </div>

            <div>
              <div className="text-white font-semibold text-base tracking-wider uppercase">
                PT Rona Karsa Apparel
              </div>

              <div className="text-[#D5CEBF] text-[11px] tracking-widest uppercase">
                Casual Essentials · Est. 2021
              </div>
            </div>
          </div>

          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-[#E8E4DE] bg-white/10 backdrop-blur-sm border border-white/20">
            ENTERPRISE ERP 17.0
          </span>
        </div>

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
              <div className="font-mono text-lg font-bold text-white">
                WH-JKT
              </div>
              <div className="text-[#8C8983] text-[11px]">
                Central Warehouse
              </div>
            </div>

            <div>
              <div className="font-mono text-lg font-bold text-white">
                STORE-BDG
              </div>
              <div className="text-[#8C8983] text-[11px]">
                Retail Store & POS
              </div>
            </div>

            <div>
              <div className="font-mono text-lg font-bold text-white">
                106 Units
              </div>
              <div className="text-[#8C8983] text-[11px]">
                Verified Opening Stock
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Login */}
      <div className="md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 bg-[#FFFEFC]">
        <div className="max-w-md w-full mx-auto">

          <div className="mb-8">
            <div className="text-xs font-mono text-[#8C8983] uppercase tracking-wider mb-1">
              PT Rona Karsa Apparel — Enterprise Workspace
            </div>

            <h2 className="text-3xl font-bold text-[#171717] tracking-tight">
              Welcome Back
            </h2>

            <p className="text-sm text-[#8C8983] mt-1.5">
              Sign in using your registered company account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#171717] mb-1.5">
                Email / Username
              </label>

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

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#171717] mb-1.5">
                Password
              </label>

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
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 bg-[#171717] hover:bg-[#282828] disabled:opacity-50 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>
                {isLoading ? 'Signing In...' : 'Sign In to Workspace'}
              </span>

              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-[#E7E3DD] text-center text-xs text-[#8C8983] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#54745B]" />

            <span>
              Role-Based Access Control (RBAC) & Audit Log Enabled (SR-16)
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
