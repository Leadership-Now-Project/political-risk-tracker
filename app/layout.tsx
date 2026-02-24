import type { Metadata } from 'next';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import DraftWatermark from '@/components/DraftWatermark';
import './globals.css';

export const metadata: Metadata = {
  title: 'US Political Risk Framework | Leadership Now',
  description: 'Track and assess political risk across 10 key categories in the United States',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-cream dark:bg-navy min-h-screen flex flex-col">
        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-navy border-t border-navy-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-yellow-white.png"
                  alt="Leadership Now Project"
                  width={150}
                  height={34}
                  className="h-8 w-auto"
                />
              </div>
              <div className="text-center md:text-right">
                <p className="text-cream/80 text-sm">
                  US Political Risk Framework Assessment
                </p>
                <p className="text-cream/60 text-xs mt-1">
                  Data updated regularly. Risk assessments are for informational purposes only.
                </p>
              </div>
            </div>
          </div>
        </footer>
        <DraftWatermark />
      </body>
    </html>
  );
}
