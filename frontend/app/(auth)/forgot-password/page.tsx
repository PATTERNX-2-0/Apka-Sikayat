"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { 
  forgotPasswordEmailSchema, 
  otpSchema, 
  resetPasswordSchema,
  ForgotPasswordEmailValues,
  OtpValues,
  ResetPasswordValues
} from '@/lib/validations/auth';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");

  // Step 1 Form: Email
  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm<ForgotPasswordEmailValues>({
    resolver: zodResolver(forgotPasswordEmailSchema),
  });

  // Step 2 Form: OTP
  const { register: registerOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
  });

  // Step 3 Form: Reset Password
  const { register: registerReset, handleSubmit: handleResetSubmit, formState: { errors: resetErrors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onEmailSubmit = async (data: ForgotPasswordEmailValues) => {
    setIsLoading(true);
    // TODO: Connect backend API to send OTP to data.email
    setTimeout(() => {
      setSavedEmail(data.email);
      setStep(2);
      setIsLoading(false);
    }, 1000);
  };

  const onOtpSubmit = async (data: OtpValues) => {
    setIsLoading(true);
    // TODO: Connect backend API to verify OTP
    setTimeout(() => {
      setStep(3);
      setIsLoading(false);
    }, 1000);
  };

  const onResetSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true);
    // TODO: Connect backend API to update password for savedEmail
    setTimeout(() => {
      setStep(4);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/50 relative overflow-hidden"
    >
      {/* Back Button */}
      {step < 4 && (
        <Link href="/login" className="absolute top-6 left-6 text-gray-400 hover:text-[#1E3A8A] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      )}

      <div className="text-center mb-8 mt-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#87CEEB]/20 mb-4">
          <ShieldCheck className="w-6 h-6 text-[#1E3A8A]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E3A8A]">
          {step === 1 && "Reset Password"}
          {step === 2 && "Verify Identity"}
          {step === 3 && "Create New Password"}
          {step === 4 && "Success!"}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {step === 1 && "Enter your email to receive an OTP."}
          {step === 2 && `We sent a 6-digit code to ${savedEmail}`}
          {step === 3 && "Please enter your new secure password."}
          {step === 4 && "Your password has been successfully reset."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input {...registerEmail('email')} type="email" className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9933]/50 focus:border-[#FF9933] bg-white/50" placeholder="name@example.com" />
              </div>
              {emailErrors.email && <p className="mt-1 text-sm text-[#EF4444]">{emailErrors.email.message}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#FF9933] to-[#FFC266] hover:opacity-90 transition-all disabled:opacity-70 font-medium">
              {isLoading ? "Sending OTP..." : "Send Reset Link"} <ArrowRight className="ml-2 w-4 h-4 mt-0.5" />
            </button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input {...registerOtp('otp')} type="text" maxLength={6} className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#87CEEB]/50 focus:border-[#87CEEB] bg-white/50 tracking-widest text-center text-lg font-semibold text-[#1E3A8A]" placeholder="••••••" />
              </div>
              {otpErrors.otp && <p className="mt-1 text-sm text-[#EF4444]">{otpErrors.otp.message}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#1E3A8A] to-[#2a4eab] hover:opacity-90 transition-all disabled:opacity-70 font-medium">
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input {...registerReset('password')} type="password" className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22C55E]/50 focus:border-[#22C55E] bg-white/50" placeholder="••••••••" />
              </div>
              {resetErrors.password && <p className="mt-1 text-sm text-[#EF4444]">{resetErrors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input {...registerReset('confirmPassword')} type="password" className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22C55E]/50 focus:border-[#22C55E] bg-white/50" placeholder="••••••••" />
              </div>
              {resetErrors.confirmPassword && <p className="mt-1 text-sm text-[#EF4444]">{resetErrors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#22C55E] to-[#16a34a] hover:opacity-90 transition-all disabled:opacity-70 font-medium">
              {isLoading ? "Saving..." : "Reset Password"}
            </button>
          </motion.form>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center pb-4">
            <CheckCircle2 className="w-16 h-16 text-[#22C55E] mx-auto mb-6" />
            <Link href="/login" className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-gray-200 text-[#1E3A8A] font-semibold hover:bg-gray-50 transition-all">
              Return to Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}