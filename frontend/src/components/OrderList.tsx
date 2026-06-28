'use client';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Order } from '@/types';

const STATUS_COLOR: Record<Order['status'], 'success' | 'warning' | 'error'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'error',
};

export function OrderList({ orders, onDelete }: { orders: Order[]; onDelete: (id: string) => void }) {
  if (!orders.length) return <Typography color="text.secondary">No orders yet.</Typography>;

  return (
    <>
      {orders.map((order) => (
        <Accordion key={order.id} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', width: '100%', pr: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {order.id.slice(0, 8)}…
              </Typography>
              <Chip
                label={order.status}
                size="small"
                color={STATUS_COLOR[order.status]}
              />
              <Typography sx={{ ml: 'auto', fontWeight: 'bold' }}>
                ${Number(order.totalAmount).toFixed(2)}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                    <TableCell align="right">
                      ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
