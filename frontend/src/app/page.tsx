'use client';
import { useEffect, useState, useMemo } from 'react';
import {
  Container, Typography, CircularProgress, Box,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { useToast } from '@/components/ToastProvider';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { ProductForm } from '@/components/ProductForm';
import { ProductList } from '@/components/ProductList';
import { api } from '@/lib/api';
import type { Product } from '@/types';

type SortKey = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const showToast = useToast();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name_asc');

  useEffect(() => {
    api.products.list().then(setProducts).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean) as string[])].sort(),
    [products],
  );

  const displayed = useMemo(() => {
    let r = products;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
      );
    }
    if (categoryFilter) r = r.filter((p) => p.category === categoryFilter);
    const sorted = [...r];
    switch (sortBy) {
      case 'name_asc':   sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc':  sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price_asc':  sorted.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'price_desc': sorted.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'stock_asc':  sorted.sort((a, b) => a.stock - b.stock); break;
      case 'stock_desc': sorted.sort((a, b) => b.stock - a.stock); break;
    }
    return sorted;
  }, [products, search, categoryFilter, sortBy]);

  const handleCreated = (p: Product) => {
    setProducts((prev) => [p, ...prev]);
    setOpen(false);
    showToast('Product added');
  };

  const handleConfirmDelete = async () => {
    if (!confirmId) return;
    try {
      await api.products.remove(confirmId);
      setProducts((prev) => prev.filter((p) => p.id !== confirmId));
      showToast('Product deleted');
    } catch (e: any) {
      showToast(e.message ?? 'Failed to delete product', 'error');
    } finally {
      setConfirmId(null);
    }
  };

  const confirmName = products.find((p) => p.id === confirmId)?.name;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">Products</Typography>
          {!loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {displayed.length}{displayed.length !== products.length ? ` of ${products.length}` : ''} {products.length === 1 ? 'item' : 'items'}
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add Product
        </Button>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 180 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
            <MenuItem value="">All categories</MenuItem>
            {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>Sort by</InputLabel>
          <Select value={sortBy} label="Sort by" onChange={(e) => setSortBy(e.target.value as SortKey)}>
            <MenuItem value="name_asc">Name A–Z</MenuItem>
            <MenuItem value="name_desc">Name Z–A</MenuItem>
            <MenuItem value="price_asc">Price: low to high</MenuItem>
            <MenuItem value="price_desc">Price: high to low</MenuItem>
            <MenuItem value="stock_asc">Stock: low to high</MenuItem>
            <MenuItem value="stock_desc">Stock: high to low</MenuItem>
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => v && setView(v)}
          size="small"
          sx={{ height: 36 }}
        >
          <ToggleButton value="grid" aria-label="grid view">
            <GridViewIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProductList products={displayed} onDelete={setConfirmId} view={view} />
      )}

      {/* Add product modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
          Add Product
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <ProductForm onCreated={handleCreated} />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmId} onClose={() => setConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <Typography><strong>"{confirmName}"</strong> will be permanently removed.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
