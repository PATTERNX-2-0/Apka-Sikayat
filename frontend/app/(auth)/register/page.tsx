"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { registerSchema, RegisterFormValues } from '@/lib/validations/auth';
import { useAuth } from '@/context/AuthContext';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  
  // We assume this page is strictly for citizens, but we can read the param for context
  const isCitizen = typeParam === 'citizen' || !typeParam; // Default to citizen if missing

  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // States for password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signUp(data.email, data.password, data.fullName, data.phone);
      router.push('/citizen');
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg("This email address is already in use.");
      } else if (err.code === "auth/weak-password") {
        setErrorMsg("The password is too weak.");
      } else {
        setErrorMsg(err.message || "Failed to create account. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full bg-linear-to-bl from-[#FF9933]/5 to-transparent pointer-events-none"></div>

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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-[#FF9933] to-[#FF8C00] mb-4 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Citizen Registration</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">Join Apka Sikayat to make your voice heard.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm rounded-xl flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('fullName')}
                type="text"
                className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition-colors bg-white/50 text-sm font-bold text-gray-900 outline-none"
                placeholder="Rahul Sharma"
              />
            </div>
            {errors.fullName && <p className="mt-1 text-sm text-[#EF4444] font-bold">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('phone')}
                type="tel"
                className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition-colors bg-white/50 text-sm font-bold text-gray-900 outline-none"
                placeholder="9876543210"
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-[#EF4444] font-bold">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition-colors bg-white/50 text-sm font-bold text-gray-900 outline-none"
                placeholder="citizen@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-[#EF4444] font-bold">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition-colors bg-white/50 text-sm font-bold text-gray-900 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-[#EF4444] font-bold">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? "text" : "password"}
                  className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition-colors bg-white/50 text-sm font-bold text-gray-900 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-[#EF4444] font-bold">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-black text-white bg-linear-to-r from-[#FF9933] to-[#FF8C00] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933] transition-all disabled:opacity-70 mt-4"
          >
            {isLoading ? "Creating Account..." : "Register Now"}
            {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-gray-500 border-t border-gray-100 pt-6">
          Already have an account?{' '}
          <Link href="/login?type=citizen" className="font-black text-[#FF9933] hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#FF9933] font-black tracking-widest uppercase bg-gray-50">Loading Portal...</div>}>
      <RegisterContent />
    </Suspense>
  );
}