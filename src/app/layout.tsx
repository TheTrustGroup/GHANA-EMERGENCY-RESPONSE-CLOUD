import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './print.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Ghana Emergency Response Platform',
  description: 'Government-grade Emergency Response Platform for Ghana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster />
            <SonnerToaster position="top-right" richColors />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

