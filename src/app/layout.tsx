import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import MainLayout from './main-layout';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ResolveX',
  description: 'Report and track local grievances seamlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <Providers>
          <div className="p-4 h-screen">
            <div className="neon-frame">
              <div className="neon-frame-inner">
                <div className="neon-stars"></div>
                <div className="neon-comet"></div>
                 <MainLayout>
                  {children}
                </MainLayout>
              </div>
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
