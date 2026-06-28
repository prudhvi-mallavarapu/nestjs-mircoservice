'use client';
import {
  Grid, Card, CardContent, Typography, Chip, IconButton, Box,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/EditOutlined';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import type { Product } from '@/types';

interface Props {
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (p: Product) => void;
  view?: 'grid' | 'list';
}

const CategoryChip = ({ label }: { label: string }) => (
  <Chip label={label} size="small" sx={{ borderRadius: 1, fontSize: '0.7rem', height: 20, bgcolor: '#FEF3E2', color: '#E67E22' }} />
);

export function ProductList({ products, onDelete, onEdit, view = 'grid' }: Props) {
  if (!products.length) {
    return (
      <Box sx={{ py: 10, textAlign: 'center', color: 'text.secondary' }}>
        <InventoryIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
        <Typography>No products found.</Typography>
      </Box>
    );
  }

  if (view === 'list') {
    return (
      <Box sx={{ border: '1px solid #E8EAF0', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', py: 1.25 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', py: 1.25 }}>Category</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', py: 1.25 }}>Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', py: 1.25 }}>Stock</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{p.name}</Typography>
                  {p.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
                      {p.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{p.category && <CategoryChip label={p.category} />}</TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontFamily: 'var(--font-dm-mono, monospace)', fontWeight: 500, fontSize: '0.9rem' }}>
                    ${Number(p.price).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">{p.stock}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ pr: 1 }}>
                  <IconButton size="small" onClick={() => onEdit(p)} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(p.id)} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {products.map((p) => (
        <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, p: 2.5 }}>
              {p.category && <CategoryChip label={p.category} />}
              <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.3 }}>{p.name}</Typography>
              {p.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.8rem' }}
                >
                  {p.description}
                </Typography>
              )}
              <Box sx={{ mt: 'auto', pt: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '1.4rem', fontWeight: 500, lineHeight: 1 }}>
                    ${Number(p.price).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                    {p.stock} in stock
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => onEdit(p)} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(p.id)} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
