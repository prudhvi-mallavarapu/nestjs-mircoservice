'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';

export function NavBar() {
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Button
      component={Link}
      href={href}
      sx={{
        color: pathname === href ? '#E67E22' : 'rgba(255,255,255,0.65)',
        fontWeight: pathname === href ? 700 : 500,
        '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
        borderRadius: 2,
        px: 1.5,
      }}
    >
      {label}
    </Button>
  );

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: '#111827', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <Toolbar sx={{ gap: 1 }}>
        <GridViewRoundedIcon sx={{ color: '#E67E22', mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', mr: 3 }}>
          Ops
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {navLink('/', 'Products')}
          {navLink('/orders', 'Orders')}
          {navLink('/form-demo', 'Form Demo')}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
