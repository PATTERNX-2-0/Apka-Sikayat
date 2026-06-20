"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { registerSchema, RegisterFormValues } from '@/lib/validations/auth';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/50 my-8"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FF9933]/10 mb-4">
          <ShieldCheck className="w-6 h-6 text-[#FF9933]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E3A8A]">Citizen Registration</h1>
        <p className="text-sm text-gray-500 mt-2">Join Apka Sikayat to make your voice heard.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('fullName')}
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#87CEEB]/50 focus:border-[#87CEEB] transition-colors bg-white/50"
              placeholder="Rahul Sharma"
            />
          </div>
          {errors.fullName && <p className="mt-1 text-sm text-[#EF4444]">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('phone')}
              type="tel"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#87CEEB]/50 focus:border-[#87CEEB] transition-colors bg-white/50"
              placeholder="9876543210"
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-[#EF4444]">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('email')}
              type="email"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#87CEEB]/50 focus:border-[#87CEEB] transition-colors bg-white/50"
              placeholder="citizen@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-[#EF4444]">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password')}
                type="password"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#87CEEB]/50 focus:border-[#87CEEB] transition-colors bg-white/50"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-[#EF4444]">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('confirmPassword')}
                type="password"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#87CEEB]/50 focus:border-[#87CEEB] transition-colors bg-white/50"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-[#EF4444]">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#1E3A8A] to-[#2a4eab] hover:from-[#1E3A8A] hover:to-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] transition-all disabled:opacity-70"
        >
          {isLoading ? "Creating Account..." : "Register Now"}
          {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#87CEEB] hover:text-[#1E3A8A] transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}