'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

type Severity = 'success' | 'error' | 'info';
type ShowToast = (message: string, severity?: Severity) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function useToast(): ShowToast {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; severity: Severity } | null>(null);

  const showToast: ShowToast = (message, severity = 'success') =>
    setToast({ message, severity });

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={toast?.severity}
          onClose={() => setToast(null)}
          sx={{ width: '100%' }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
