'use client';
import Link from 'next/link';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

export function NavBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={Link} href="/">Products</Button>
          <Button color="inherit" component={Link} href="/orders">Orders</Button>
          <Button color="inherit" component={Link} href="/form-demo">Form Demo</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
