import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'N4Y LOGOS Studio - Autonomous Agent Creation',
  description: 'Create and deploy autonomous agents on the blockchain with N4Y LOGOS Studio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <Providers>
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}