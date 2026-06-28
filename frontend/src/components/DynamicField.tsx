'use client';
import {
  Controller,
  Control,
  RegisterOptions,
} from 'react-hook-form';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormHelperText,
} from '@mui/material';
import type { FieldConfig } from '@/types';

interface Props {
  field: FieldConfig;
  control: Control<Record<string, string>>;
}

export function DynamicField({ field, control }: Props) {
  const fieldName = String(field.id);
  const rules: RegisterOptions = {
    required: field.required ? `${field.name} is required` : false,
    ...(field.minLength && {
      minLength: { value: field.minLength, message: `Minimum ${field.minLength} characters` },
    }),
    ...(field.maxLength && {
      maxLength: { value: field.maxLength, message: `Maximum ${field.maxLength} characters` },
    }),
  };

  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={field.defaultValue ?? ''}
      rules={rules}
      render={({ field: f, fieldState }) => {
        if (field.fieldType === 'TEXT') {
          return (
            <TextField
              {...f}
              label={field.name}
              fullWidth
              required={field.required}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              slotProps={{ htmlInput: { minLength: field.minLength, maxLength: field.maxLength } }}
            />
          );
        }

        if (field.fieldType === 'LIST') {
          return (
            <FormControl fullWidth required={field.required} error={!!fieldState.error}>
              <InputLabel>{field.name}</InputLabel>
              <Select {...f} label={field.name}>
                {field.listOfValues?.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
              {fieldState.error && (
                <FormHelperText>{fieldState.error.message}</FormHelperText>
              )}
            </FormControl>
          );
        }

        if (field.fieldType === 'RADIO') {
          return (
            <FormControl required={field.required} error={!!fieldState.error}>
              <FormLabel>{field.name}</FormLabel>
              <RadioGroup {...f} row>
                {field.listOfValues?.map((opt) => (
                  <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                ))}
              </RadioGroup>
              {fieldState.error && (
                <FormHelperText>{fieldState.error.message}</FormHelperText>
              )}
            </FormControl>
          );
        }

        return <></>;

      }}
    />
  );
}
