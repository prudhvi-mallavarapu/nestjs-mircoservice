import type { Metadata } from 'next';
import { DM_Sans, DM_Mono } from 'next/font/google';
import { ThemeRegistry } from '@/components/ThemeRegistry';
import { NavBar } from '@/components/NavBar';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Ops Dashboard',
  description: 'Product & Order management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <ThemeRegistry>
          <NavBar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
