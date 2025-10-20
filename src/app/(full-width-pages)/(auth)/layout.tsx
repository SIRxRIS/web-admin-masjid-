import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="relative w-full bg-white dark:bg-gray-900">
        <div className="relative flex flex-col md:flex-row w-full min-h-screen dark:bg-gray-900">
          {/* Form Section */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-12 md:py-0 min-h-screen md:min-h-auto bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 md:from-white md:via-white md:to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
            {children}
          </div>

          {/* Logo Section - Hidden on mobile, visible on md and above */}
          <div className="hidden md:flex md:w-1/2 h-screen bg-brand-950 dark:bg-white/5 items-center justify-center">
            <div className="relative items-center justify-center flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-lg">
                <Link href="/" className="block mb-1 md:mb-6">
                  <div className="relative w-[320px] h-[320px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px]">
                    <Image
                      fill
                      src="/images/logo-masjid-bgwhite.png"
                      alt="Logo Masjid Jawahiruzzarqa"
                      className="rounded-3xl overflow-hidden object-contain"
                      sizes="(max-width: 768px) 320px, (max-width: 1024px) 280px, 320px"
                      priority
                    />
                  </div>
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  Web Admin Masjid Jawahiruzzarqa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Toggler */}
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </ThemeProvider>
  );
}