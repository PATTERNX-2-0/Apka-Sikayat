import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apka Sikayat | Login",
  description: "AI-Powered CM Grievance Intelligence & Accountability Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900">
        {children}
      </body>
    </html>
  );
}