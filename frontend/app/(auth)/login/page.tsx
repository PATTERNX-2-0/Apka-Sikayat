"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ArrowLeft, Building2, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { loginSchema, LoginFormValues } from '@/lib/validations/auth';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Demo Credentials for quick access during presentation
const DEMO_ACCOUNTS = [
  { role: 'Citizen', email: 'citizen@demo.com' },
  { role: 'Officer', email: 'officer@demo.com' },
  { role: 'Dept Head', email: 'dept@demo.com' },
  { role: 'CM Office', email: 'cm@demo.com' },
  { role: 'District Mgr', email: 'district@demo.com' },
  { role: 'State Admin', email: 'stateadmin@demo.com' },
  { role: 'Super Admin', email: 'superadmin@demo.com' },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  
  // Strict check: if type is official, lock UI to official. Otherwise default to citizen.
  const isOfficial = typeParam === 'official';

  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await signIn(data.email, data.password);
      
      let role = 'Citizen';
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          role = userDoc.data().role || 'Citizen';
        }
      } catch (dbErr) {
        console.error("Error reading role from Firestore, using email fallbacks:", dbErr);
        if (data.email === 'officer@demo.com') {
          role = 'Officer';
        } else if (data.email === 'dept@demo.com') {
          role = 'Dept Head';
        } else if (data.email === 'cm@demo.com') {
          role = 'CM Office';
        } else if (data.email === 'district@demo.com') {
          role = 'District Manager';
        } else if (data.email === 'stateadmin@demo.com') {
          role = 'State Administrator';
        } else if (data.email === 'superadmin@demo.com') {
          role = 'Super Admin';
        }
      }
      
      if (role === 'Citizen') {
        router.push('/citizen');
      } else if (role === 'Officer') {
        router.push('/officer');
      } else if (role === 'Dept Head' || role === 'Department Head') {
        router.push('/department');
      } else if (role === 'CM Office' || role === 'Chief Minister') {
        router.push('/cm');
      } else if (role === 'District Manager') {
        router.push('/district');
      } else if (role === 'State Administrator') {
        router.push('/state-admin');
      } else if (role === 'Super Admin') {
        router.push('/super-admin');
      } else {
        router.push('/citizen');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message === 'WHATSAPP_USER_NO_CUSTOM_TOKEN') {
        setErrorMsg("Your WhatsApp account was found, but the server is not fully configured to issue a login token. Please contact support.");
      } else if (err.message && !err.code) {
        // Backend returned a clear error message (e.g., "Invalid email or password.")
        setErrorMsg(err.message);
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setErrorMsg("Invalid email or password.");
      } else {
        setErrorMsg(err.message || "Failed to sign in. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const loadDemoUser = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background styling based on role */}
      {isOfficial ? (
        <div className="absolute top-0 right-0 w-full h-full bg-linear-to-bl from-[#1E3A8A]/5 to-transparent pointer-events-none"></div>
      ) : (
        <div className="absolute top-0 right-0 w-full h-full bg-linear-to-bl from-[#FF9933]/5 to-transparent pointer-events-none"></div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/50 relative z-10"
      >
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#FF9933] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg ${isOfficial ? 'bg-linear-to-br from-[#1E3A8A] to-[#0f172a]' : 'bg-linear-to-br from-[#FF9933] to-[#FF8C00]'}`}>
            {isOfficial ? <Building2 className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {isOfficial ? 'Official Government Portal' : 'Citizen Access Portal'}
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            {isOfficial ? 'Authorized state personnel access only.' : 'Sign in to track and file your grievances.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm rounded-xl flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
              {isOfficial ? 'Official Email / Gov ID' : 'Email Address'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                className={`block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-colors bg-white/50 text-sm font-bold text-gray-900 outline-none ${
                  isOfficial ? 'focus:ring-[#1E3A8A]' : 'focus:ring-[#FF9933]'
                }`}
                placeholder={isOfficial ? 'officer@delhi.gov.in' : 'name@example.com'}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-[#EF4444] font-bold">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500">Secure Password</label>
              <Link href="/forgot-password" className={`text-xs font-black hover:underline transition-colors ${isOfficial ? 'text-[#1E3A8A]' : 'text-[#FF9933]'}`}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? "text" : "password"}
                className={`block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-colors bg-white/50 text-sm font-bold text-gray-900 outline-none ${
                  isOfficial ? 'focus:ring-[#1E3A8A]' : 'focus:ring-[#FF9933]'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-[#EF4444] font-bold">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-black text-white transition-all disabled:opacity-70 mt-2 ${
              isOfficial 
                ? 'bg-linear-to-r from-[#1E3A8A] to-[#0f172a] hover:shadow-lg' 
                : 'bg-linear-to-r from-[#FF9933] to-[#FF8C00] hover:shadow-lg'
            }`}
          >
            {isLoading ? "Authenticating..." : (isOfficial ? "Secure Login" : "Sign In")}
            {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
          </button>
        </form>

        {/* Demo Credentials Section (Filtered based on type) */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400 mb-3 font-black uppercase tracking-widest">Demo Access</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {DEMO_ACCOUNTS.filter(d => isOfficial ? d.role !== 'Citizen' : d.role === 'Citizen').map((demo) => (
              <button
                key={demo.role}
                onClick={() => loadDemoUser(demo.email)}
                type="button"
                className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border transition-colors ${
                  isOfficial 
                    ? 'border-[#87CEEB]/30 bg-[#87CEEB]/10 text-[#1E3A8A] hover:bg-[#87CEEB]/20' 
                    : 'border-[#FF9933]/30 bg-[#FF9933]/10 text-[#FF8C00] hover:bg-[#FF9933]/20'
                }`}
              >
                {demo.role}
              </button>
            ))}
          </div>
        </div>

        {/* Hide registration link for officials */}
        {!isOfficial && (
          <p className="mt-8 text-center text-sm font-medium text-gray-500">
            Don't have a citizen account?{' '}
            <Link href="/register?type=citizen" className="font-black text-[#FF9933] hover:underline transition-colors">
              Register here
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#1E3A8A] font-black tracking-widest uppercase bg-gray-50">Loading Portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}