'use client';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Paper, IconButton, Typography, Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Product } from '@/types';

interface Props {
  products: Product[];
  onDelete: (id: string) => void;
}

export function ProductList({ products, onDelete }: Props) {
  if (!products.length) return <Typography color="text.secondary">No products yet.</Typography>;

  return (
    <Paper>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Stock</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} hover>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.category ? <Chip label={p.category} size="small" /> : '—'}</TableCell>
              <TableCell align="right">${Number(p.price).toFixed(2)}</TableCell>
              <TableCell align="right">{p.stock}</TableCell>
              <TableCell align="right">
                <IconButton size="small" color="error" onClick={() => onDelete(p.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
