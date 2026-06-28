'use client';
import { useEffect, useState } from 'react';
import { Container, Typography, Divider, CircularProgress, Box } from '@mui/material';
import { OrderForm } from '@/components/OrderForm';
import { OrderList } from '@/components/OrderList';
import { api } from '@/lib/api';
import type { Order, Product } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.orders.list(), api.products.list()])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (o: Order) => setOrders((prev) => [o, ...prev]);

  const handleDelete = async (id: string) => {
    await api.orders.remove(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Orders</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <OrderForm products={products} onCreated={handleCreated} />
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Order History</Typography>
          <OrderList orders={orders} onDelete={handleDelete} />
        </>
      )}
    </Container>
  );
}
