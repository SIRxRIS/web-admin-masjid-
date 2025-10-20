import { Outfit } from 'next/font/google';
import './globals.css';
import type { Metadata } from "next";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ClientErrorHandler } from '@/components/ClientErrorHandler';

const outfit = Outfit({
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ClientErrorHandler />
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: {
    default: 'Masjid Jawahiruzzarqa',
    template: '%s | Masjid Jawahiruzzarqa',
  },
  description: 'Portal manajemen Masjid Jawahiruzzarqa.',
};
