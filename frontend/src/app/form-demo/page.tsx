'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Container, Typography, Button, Stack, Alert,
  Paper, Box, Divider, List, ListItem, ListItemText,
} from '@mui/material';
import { DynamicField } from '@/components/DynamicField';
import { formConfig } from '@/lib/formConfig';

const STORAGE_KEY = 'form_demo_submissions';

export default function FormDemoPage() {
  const { control, handleSubmit, reset } = useForm<Record<string, string>>();
  const [submissions, setSubmissions] = useState<Record<string, string>[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSubmissions(JSON.parse(stored));
  }, []);

  const onSubmit = (values: Record<string, string>) => {
    const next = [values, ...submissions];
    setSubmissions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Signup Form Demo</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fields are driven by the JSON config in <code>lib/formConfig.ts</code>.
        Change <code>fieldType</code> from TEXT → LIST → RADIO to see them swap.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {formConfig.map((field) => (
              <DynamicField key={field.id} field={field} control={control} />
            ))}
            {submitted && <Alert severity="success">Saved to localStorage!</Alert>}
            <Button type="submit" variant="contained" size="large">Submit</Button>
          </Stack>
        </Box>
      </Paper>

      {submissions.length > 0 && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>Past Submissions</Typography>
          <List dense>
            {submissions.map((sub, i) => (
              <Paper key={i} sx={{ mb: 1 }}>
                <ListItem>
                  <ListItemText
                    primary={formConfig.map((f) => `${f.name}: ${sub[f.id] ?? '—'}`).join(' · ')}
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        </>
      )}
    </Container>
  );
}
