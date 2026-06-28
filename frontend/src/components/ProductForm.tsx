'use client';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Button, TextField, Stack, Alert, Autocomplete,
} from '@mui/material';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@/types';

const CATEGORIES = ['Peripherals', 'Accessories', 'Workspace', 'Audio', 'Networking', 'Storage', 'Displays'];

interface FormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export function ProductForm({ onCreated }: { onCreated: (p: Product) => void }) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>();
  const [error, setError] = useState('');

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      const product = await api.products.create({
        ...values,
        price: Number(values.price),
        stock: Number(values.stock),
      });
      onCreated(product);
      reset();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField label="Name" {...register('name', { required: 'Required' })}
          error={!!errors.name} helperText={errors.name?.message} />
        <TextField label="Description" {...register('description')} />
        <TextField label="Price" type="number" slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
          {...register('price', { required: 'Required' })}
          error={!!errors.price} helperText={errors.price?.message} />
        <TextField label="Stock" type="number" slotProps={{ htmlInput: { min: '0' } }}
          {...register('stock', { required: 'Required' })}
          error={!!errors.stock} helperText={errors.stock?.message} />
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={CATEGORIES}
              freeSolo
              value={field.value ?? ''}
              onChange={(_, v) => field.onChange(v ?? '')}
              renderInput={(params) => <TextField {...params} label="Category" />}
            />
          )}
        />
        <Button type="submit" variant="contained">Create Product</Button>
      </Stack>
    </Box>
  );
}
