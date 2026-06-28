import type { Metadata } from 'next';
import { ThemeRegistry } from '@/components/ThemeRegistry';
import { NavBar } from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Microservice App',
  description: 'Product & Order management with dynamic forms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <NavBar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
