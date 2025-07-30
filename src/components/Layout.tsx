"use client";

import { ReactNode, useEffect, useState } from "react";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import { LanguageProvider } from "../Context/LanguageContext";
import NavBanner from "./pages/HomePage/NavBaner";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent rendering on server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen overflow-x-hidden max-w-full">
        <Header />
        <NavBanner />
        <main className="max-w-full overflow-x-hidden">{children}</main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}