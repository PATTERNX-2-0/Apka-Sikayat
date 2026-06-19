import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F8FAFC]">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#FF9933]/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-[#87CEEB]/30 to-transparent blur-3xl" />
      </div>

      {/* Auth Card Container */}
      <div className="z-10 w-full max-w-md p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}