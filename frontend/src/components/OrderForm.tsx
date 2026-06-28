'use client';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  Box, Button, TextField, Typography, Stack, Alert,
  IconButton, MenuItem, Select, InputLabel, FormControl, FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { Order, Product } from '@/types';

interface FormValues {
  items: { productId: string; quantity: number }[];
}

export function OrderForm({
  products,
  onCreated,
}: {
  products: Product[];
  onCreated: (o: Order) => void;
}) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { items: [{ productId: '', quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const [error, setError] = useState('');

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      const order = await api.orders.create({
        items: values.items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
        })),
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
          <Stack key={field.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Controller
              name={`items.${idx}.productId`}
              control={control}
              rules={{ required: 'Product required' }}
              render={({ field: f, fieldState }) => (
                <FormControl sx={{ minWidth: 200 }} error={!!fieldState.error}>
                  <InputLabel>Product</InputLabel>
                  <Select {...f} label="Product">
                    {products.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name} (stock: {p.stock})
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && (
                    <FormHelperText>{fieldState.error.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
            <TextField
              label="Qty"
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
              sx={{ width: 80 }}
              {...register(`items.${idx}.quantity`, { required: true, min: 1 })}
            />
            <IconButton color="error" onClick={() => remove(idx)} disabled={fields.length === 1}>
              <RemoveIcon />
            </IconButton>
          </Stack>
        ))}
        <Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => append({ productId: '', quantity: 1 })}
          >
            Add Item
          </Button>
        </Box>
        <Button type="submit" variant="contained">Place Order</Button>
      </Stack>
    </Box>
  );
}
