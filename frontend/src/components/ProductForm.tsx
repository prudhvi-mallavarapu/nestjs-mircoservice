'use client';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, TextField, Stack, Autocomplete } from '@mui/material';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
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
  const showToast = useToast();

  const onSubmit = async (values: FormValues) => {
    try {
      const product = await api.products.create({
        ...values,
        price: Number(values.price),
        stock: Number(values.stock),
      });
      onCreated(product);
      reset();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField
          label="Name"
          required
          {...register('name', { required: 'Name is required' })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField label="Description (optional)" {...register('description')} />
        <TextField
          label="Price"
          required
          type="number"
          slotProps={{ htmlInput: { step: '0.01', min: '0.01' } }}
          {...register('price', {
            required: 'Price is required',
            min: { value: 0.01, message: 'Must be greater than 0' },
            valueAsNumber: true,
          })}
          error={!!errors.price}
          helperText={errors.price?.message}
        />
        <TextField
          label="Stock"
          required
          type="number"
          slotProps={{ htmlInput: { min: '0', step: '1' } }}
          {...register('stock', {
            required: 'Stock is required',
            min: { value: 0, message: 'Must be 0 or more' },
            validate: (v) => Number.isInteger(Number(v)) || 'Must be a whole number',
            valueAsNumber: true,
          })}
          error={!!errors.stock}
          helperText={errors.stock?.message}
        />
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={CATEGORIES}
              freeSolo
              value={field.value ?? ''}
              onChange={(_, v) => field.onChange(v ?? '')}
              renderInput={(params) => <TextField {...params} label="Category (optional)" />}
            />
          )}
        />
        <Button type="submit" variant="contained">Create Product</Button>
      </Stack>
    </Box>
  );
}
