'use client';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  Box, Button, Typography, Stack, Alert,
  IconButton, MenuItem, Select, InputLabel, FormControl, FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { Order, Product } from '@/types';

interface FormValues {
  items: { productId: string; quantity: number }[];
}

export function OrderForm({ products, onCreated }: { products: Product[]; onCreated: (o: Order) => void }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { items: [{ productId: '', quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const [error, setError] = useState('');

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      const order = await api.orders.create({
        items: values.items.map((i) => ({ productId: i.productId, quantity: Number(i.quantity) })),
      });
      onCreated(order);
      reset();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>Create Order</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        {fields.map((field, idx) => (
          <Stack key={field.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Controller
              name={`items.${idx}.productId`}
              control={control}
              rules={{ required: 'Product required' }}
              render={({ field: f, fieldState }) => (
                <FormControl sx={{ minWidth: 220 }} size="small" error={!!fieldState.error}>
                  <InputLabel>Product</InputLabel>
                  <Select {...f} label="Product">
                    {products.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {p.stock} in stock
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />

            {/* Quantity stepper — height matches MUI size="small" Select (40px) */}
            <Controller
              name={`items.${idx}.quantity`}
              control={control}
              rules={{ required: true, min: 1 }}
              render={({ field: f }) => (
                <Stack direction="row" alignItems="center" sx={{ border: '1px solid rgba(0,0,0,0.23)', borderRadius: 1.5, overflow: 'hidden', height: 40, flexShrink: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => f.onChange(Math.max(1, Number(f.value) - 1))}
                    sx={{ borderRadius: 0, px: 1, height: '100%' }}
                  >
                    <RemoveIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Box
                    component="input"
                    type="number"
                    value={f.value}
                    onChange={(e) => f.onChange(Math.max(1, Number(e.target.value) || 1))}
                    sx={{
                      width: 44, textAlign: 'center', border: 'none', outline: 'none',
                      fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '0.9rem',
                      bgcolor: 'transparent', color: 'text.primary',
                      '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': { WebkitAppearance: 'none' },
                      MozAppearance: 'textfield',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => f.onChange(Number(f.value) + 1)}
                    sx={{ borderRadius: 0, px: 1, height: '100%' }}
                  >
                    <AddIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Stack>
              )}
            />

            <IconButton
              color="error"
              size="small"
              onClick={() => remove(idx)}
              disabled={fields.length === 1}
              sx={{ mt: '4px', opacity: fields.length === 1 ? 0.3 : 0.6, '&:hover': { opacity: 1 } }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}

        <Box>
          <Button size="small" startIcon={<AddIcon />} onClick={() => append({ productId: '', quantity: 1 })}>
            Add Item
          </Button>
        </Box>
        <Button type="submit" variant="contained">Place Order</Button>
      </Stack>
    </Box>
  );
}
