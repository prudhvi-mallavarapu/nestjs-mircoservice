'use client';
import { useEffect, useState } from 'react';
import { Container, Typography, Divider, CircularProgress, Box } from '@mui/material';
import { ProductForm } from '@/components/ProductForm';
import { ProductList } from '@/components/ProductList';
import { api } from '@/lib/api';
import type { Product } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products.list()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (p: Product) => setProducts((prev) => [p, ...prev]);

  const handleDelete = async (id: string) => {
    await api.products.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Products</Typography>
      <ProductForm onCreated={handleCreated} />
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>Product List</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProductList products={products} onDelete={handleDelete} />
      )}
    </Container>
  );
}
