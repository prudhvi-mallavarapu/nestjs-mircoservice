'use client';
import { useForm } from 'react-hook-form';
import {
  Container, Typography, Button, Stack, Alert,
  Paper, Box, Divider, List, ListItem, ListItemText,
  Grid, TextField,
} from '@mui/material';
import { DynamicField } from '@/components/DynamicField';
import { formConfig as initialConfig } from '@/lib/formConfig';
import { useJsonConfig, buildDefaults } from '@/hooks/useJsonConfig';
import { useSubmissions } from '@/hooks/useSubmissions';

export default function FormDemoPage() {
  const { control, handleSubmit, reset } = useForm<Record<string, string>>({
    defaultValues: buildDefaults(initialConfig),
  });

  const { config, jsonText, jsonError, handleJsonChange, resetJson } = useJsonConfig(
    (_next, defaults) => reset(defaults)
  );

  const { submissions, submitted, saveSubmission, clearSubmissions } = useSubmissions();

  const onSubmit = (values: Record<string, string>) => {
    saveSubmission(values, config);
    reset(buildDefaults(config));
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                JSON Config Editor
              </Typography>
              <Button size="small" variant="outlined" onClick={resetJson}>
                Reset JSON
              </Button>
            </Box>
            {jsonError && <Alert severity="error" sx={{ mb: 1 }}>{jsonError}</Alert>}
            <TextField
              multiline
              minRows={18}
              maxRows={28}
              fullWidth
              label="JSON Config"
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              error={!!jsonError}
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Past Submissions</Typography>
                <Button size="small" variant="outlined" color="error" onClick={clearSubmissions}>
                  Clear
                </Button>
              </Box>
              <List dense>
                {submissions.map((sub, i) => (
                  <Paper key={i} sx={{ mb: 1 }}>
                    <ListItem>
                      <ListItemText
                        primary={sub.map((f) => `${f.label}: ${f.value || '—'}`).join(' · ')}
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
