"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', label: 'English (EN)' },
  { code: 'hi', label: 'हिंदी (HI)' },
  { code: 'bn', label: 'বাংলা (BN)' },
  { code: 'ur', label: 'اردو (UR)' },
  { code: 'pa', label: 'ਪੰਜਾਬی (PA)' }
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Google Translate Script & Read Current Language
  useEffect(() => {
    // 1. Read current language from Google's cookie
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match && match[1]) {
      const selectedLang = match[1].split('/')[2];
      if (selectedLang) setCurrentLang(selectedLang);
    }

    // 2. Inject Google Translate script if not present
    if (!document.querySelector("#google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element"
        );
      };
    }

    // 3. Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle changing the language
  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // Set the Google Translate cookie
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`; // fallback

    // Reload the page to apply the translation
    window.location.reload();
  };

  const activeLanguageLabel = LANGUAGES.find(l => l.code === currentLang)?.label || 'English (EN)';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden div required by Google Translate */}
      <div id="google_translate_element" className="hidden"></div>

      {/* THE BEAUTIFUL PILL BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md hover:border-[#1E3A8A]/30 transition-all duration-200"
      >
        <Globe className="w-4 h-4 text-[#1E3A8A]" />
        <span className="text-sm font-bold text-[#1E3A8A]">{activeLanguageLabel}</span>
        <ChevronDown className={`w-4 h-4 text-[#1E3A8A] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* CUSTOM DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-4 py-3 text-sm font-bold text-left transition-colors ${
                  currentLang === lang.code 
                    ? 'bg-[#1E3A8A]/5 text-[#FF9933]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add TypeScript definitions for the global window object
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}