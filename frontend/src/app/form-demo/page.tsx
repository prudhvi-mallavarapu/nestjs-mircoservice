'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Container, Typography, Button, Stack, Alert,
  Paper, Box, Divider, List, ListItem, ListItemText,
  Grid, TextField,
} from '@mui/material';
import { DynamicField } from '@/components/DynamicField';
import { formConfig as initialConfig } from '@/lib/formConfig';
import type { FieldConfig } from '@/types';

const STORAGE_KEY = 'form_demo_submissions';

function buildDefaults(fields: FieldConfig[]): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [String(f.id), f.defaultValue ?? '']));
}

function validateConfig(parsed: unknown): string | null {
  if (!Array.isArray(parsed)) return 'Config must be a JSON array';
  for (const item of parsed as Record<string, unknown>[]) {
    if (item.id == null) return 'Each field must have an id';
    if (!item.name) return 'Each field must have a name';
    if (!['TEXT', 'LIST', 'RADIO'].includes(item.fieldType as string))
      return 'fieldType must be TEXT, LIST, or RADIO';
  }
  return null;
}

export default function FormDemoPage() {
  const [config, setConfig] = useState<FieldConfig[]>(initialConfig);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(initialConfig, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, string>[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { control, handleSubmit, reset } = useForm<Record<string, string>>({
    defaultValues: buildDefaults(initialConfig),
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSubmissions(JSON.parse(stored));
    } catch {
      // corrupted localStorage — start fresh
    }
  }, []);

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      const err = validateConfig(parsed);
      if (err) { setJsonError(err); return; }
      setConfig((prev) => {
        const prevIds = prev.map((f) => f.id).join(',');
        const nextIds = (parsed as FieldConfig[]).map((f) => f.id).join(',');
        if (prevIds !== nextIds) reset(buildDefaults(parsed as FieldConfig[]));
        return parsed as FieldConfig[];
      });
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  const onSubmit = (values: Record<string, string>) => {
    const next = [values, ...submissions];
    setSubmissions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSubmitted(true);
    reset(buildDefaults(config));
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Signup Form — Live Demo</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Edit the JSON on the left. Change <code>fieldType</code> between{' '}
        <code>TEXT</code>, <code>LIST</code>, and <code>RADIO</code> to see the form update live.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>
              JSON Config Editor
            </Typography>
            <TextField
              multiline
              minRows={18}
              fullWidth
              label="JSON Config"
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              error={!!jsonError}
              helperText={jsonError ?? ' '}
              slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontSize: 13 } } }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>
              Signup Form
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                {config.map((field) => (
                  <DynamicField key={field.id} field={field} control={control} />
                ))}
                {submitted && <Alert severity="success">Saved to localStorage!</Alert>}
                <Button type="submit" variant="contained" size="large">Submit</Button>
              </Stack>
            </Box>
          </Paper>

          {submissions.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Past Submissions</Typography>
              <List dense>
                {submissions.map((sub, i) => (
                  <Paper key={i} sx={{ mb: 1 }}>
                    <ListItem>
                      <ListItemText
                        primary={config.map((f) => `${f.name}: ${sub[String(f.id)] ?? '—'}`).join(' · ')}
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
