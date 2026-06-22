"use client";

import { useEffect } from "react";

export default function GoogleTranslate() {
  useEffect(() => {
    // Only add the script if it doesn't already exist
    if (!document.querySelector("#google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      // Define the callback function Google expects
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            // You can restrict languages here (e.g., 'hi,bn,es') or leave it blank for all
            includedLanguages: "en,hi,bn,te,ta,mr,ur", 
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      };
    }
  }, []);

  return <div id="google_translate_element" className="inline-block mt-1"></div>;
}

// Add TypeScript definitions for the global window object
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}