"use client";

import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("@/components/layout/Header"), {
  ssr: false,
  loading: () => (
    <>
      <header className="fixed top-0 z-50 w-full bg-white backdrop-blur supports-backdrop-filter:bg-white border-b h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center">
            {/* Loading skeleton */}
            <div className="flex-1 flex items-center justify-between">
              <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div aria-hidden className="h-20 w-full" />
    </>
  ),
});

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
