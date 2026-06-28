import type { Metadata } from 'next';
import Link from 'next/link';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { ThemeRegistry } from '@/components/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Microservice App',
  description: 'Product & Order management with dynamic forms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AppBar position="static">
            <Toolbar>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button color="inherit" component={Link} href="/">Products</Button>
                <Button color="inherit" component={Link} href="/orders">Orders</Button>
                <Button color="inherit" component={Link} href="/form-demo">Form Demo</Button>
              </Box>
            </Toolbar>
          </AppBar>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
