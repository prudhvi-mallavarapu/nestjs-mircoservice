'use client';
import { ReactNode, useState } from 'react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#E67E22', contrastText: '#fff' },
    secondary: { main: '#111827', contrastText: '#fff' },
    background: { default: '#F4F6F9', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#6B7280' },
    success: { main: '#16A34A' },
    error: { main: '#DC2626' },
    warning: { main: '#D97706' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          border: '1px solid #E8EAF0',
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
});

export function ThemeRegistry({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const c = createCache({ key: 'mui' });
    c.compat = true;
    const prevInsert = c.insert.bind(c);
    let inserted: string[] = [];
    c.insert = (...args) => {
      const name = args[1].name;
      if (c.inserted[name] === undefined) inserted.push(name);
      return prevInsert(...args);
    };
    return { cache: c, flush: () => { const p = inserted; inserted = []; return p; } };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (!names.length) return null;
    const styles = names.map((n) => cache.inserted[n]).join('');
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
