'use client';
import { useEffect, useState, useMemo } from 'react';
import {
  Container, Typography, CircularProgress, Box,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stack, Chip,
} from '@mui/material';
import { useToast } from '@/components/ToastProvider';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { OrderForm } from '@/components/OrderForm';
import { OrderList } from '@/components/OrderList';
import { api } from '@/lib/api';
import type { Order, Product } from '@/types';

type StatusFilter = 'ALL' | Order['status'];

const FILTERS: StatusFilter[] = ['ALL', 'CONFIRMED', 'CANCELLED'];
const FILTER_COLOR: Record<StatusFilter, 'default' | 'success' | 'error'> = {
  ALL: 'default',
  CONFIRMED: 'success',
  CANCELLED: 'error',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const showToast = useToast();

  useEffect(() => {
    Promise.all([api.orders.list(), api.products.list()])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (o: Order) => {
    setOrders((prev) => [o, ...prev]);
    setOpen(false);
    showToast('Order placed');
    api.products.list().then(setProducts).catch(() => {});
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      const updated = await api.orders.updateStatus(cancelId, 'CANCELLED');
      setOrders((prev) => prev.map((o) => (o.id === cancelId ? updated : o)));
      showToast('Order cancelled');
    } catch (e: any) {
      showToast(e.message ?? 'Failed to cancel order', 'error');
    } finally {
      setCancelId(null);
    }
  };

  const displayed = useMemo(
    () => (statusFilter === 'ALL' ? orders : orders.filter((o) => o.status === statusFilter))
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders, statusFilter],
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">Orders</Typography>
          {!loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {displayed.length}{displayed.length !== orders.length ? ` of ${orders.length}` : ''}{' '}
              {orders.length === 1 ? 'order' : 'orders'}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            if (!loading && products.length === 0) {
              showToast('No products available to order', 'info');
            } else {
              setOpen(true);
            }
          }}
        >
          New Order
        </Button>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        {FILTERS.map((s) => {
          const count = s === 'ALL' ? orders.length : orders.filter((o) => o.status === s).length;
          const label = s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase();
          return (
            <Chip
              key={s}
              label={`${label} · ${count}`}
              onClick={() => setStatusFilter(s)}
              variant={statusFilter === s ? 'filled' : 'outlined'}
              color={FILTER_COLOR[s]}
              size="small"
              sx={{ fontWeight: statusFilter === s ? 600 : 400, cursor: 'pointer' }}
            />
          );
        })}
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <OrderList orders={displayed} onCancel={setCancelId} />
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
          New Order
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <OrderForm products={products} onCreated={handleCreated} />
        </DialogContent>
      </Dialog>
      <Dialog open={!!cancelId} onClose={() => setCancelId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel order?</DialogTitle>
        <DialogContent>
          <Typography>This order will be marked as cancelled.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelId(null)}>Back</Button>
          <Button variant="contained" color="warning" onClick={handleCancel}>Cancel order</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
