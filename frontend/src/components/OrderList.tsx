'use client';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Stack, Box, Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import type { Order } from '@/types';

const STATUS_COLOR: Record<Order['status'], 'success' | 'error'> = {
  CONFIRMED: 'success',
  CANCELLED: 'error',
};

export function OrderList({ orders, onCancel }: {
  orders: Order[];
  onCancel: (id: string) => void;
}) {
  if (!orders.length) {
    return (
      <Box sx={{ py: 10, textAlign: 'center', color: 'text.secondary' }}>
        <ShoppingCartOutlinedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
        <Typography>No orders here.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {orders.map((order) => (
        <Box key={order.id} sx={{ position: 'relative' }}>
          {/* Cancel button lives OUTSIDE AccordionSummary to avoid <button> inside <button> */}
          {order.status !== 'CANCELLED' && (
            <Tooltip title="Cancel order">
              <IconButton
                size="small"
                onClick={() => onCancel(order.id)}
                sx={{ position: 'absolute', right: 52, top: 14, opacity: 0.5, '&:hover': { opacity: 1 }, zIndex: 1 }}
              >
                <BlockOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Accordion
            disableGutters
            sx={{
              border: '1px solid #E8EAF0',
              borderRadius: '10px !important',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              '&:before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 52, px: 2 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', width: '100%', pr: order.status !== 'CANCELLED' ? 5 : 1 }}>
              <Typography variant="body2" sx={{ fontFamily: 'var(--font-dm-mono, monospace)', color: 'text.secondary', fontSize: '0.75rem', flexShrink: 0 }}>
                {order.id.slice(0, 8)}…
              </Typography>
              <Chip
                label={order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                size="small"
                color={STATUS_COLOR[order.status]}
                sx={{ fontWeight: 600, fontSize: '0.7rem', flexShrink: 0 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
              <Typography sx={{ ml: 'auto', fontFamily: 'var(--font-dm-mono, monospace)', fontWeight: 600, fontSize: '1rem', flexShrink: 0 }}>
                ${Number(order.totalAmount).toFixed(2)}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2, borderTop: '1px solid #F0F0F0' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 600, pb: 0.5 }}>Product</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 600, pb: 0.5 }}>Qty</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 600, pb: 0.5 }}>Unit Price</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 600, pb: 0.5 }}>Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{item.productName || 'Unknown'}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{item.quantity}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '0.82rem' }}>
                      ${Number(item.unitPrice).toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'var(--font-dm-mono, monospace)', fontWeight: 600, fontSize: '0.82rem' }}>
                      ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
          </Accordion>
        </Box>
      ))}
    </Stack>
  );
}
