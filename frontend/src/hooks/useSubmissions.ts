'use client';
import { useEffect, useState } from 'react';
import type { FieldConfig } from '@/types';

const STORAGE_KEY = 'form_demo_submissions';

export type Submission = { label: string; value: string }[];

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate new format (array of arrays); clear old Record<string,string>[] format
        if (Array.isArray(parsed) && parsed.every((s: unknown) => Array.isArray(s))) {
          setSubmissions(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // corrupted localStorage — start fresh
    }
  }, []);

  const saveSubmission = (values: Record<string, string>, config: FieldConfig[]) => {
    const entry: Submission = config.map((f) => ({ label: f.name, value: values[String(f.id)] ?? '' }));
    const next = [entry, ...submissions];
    setSubmissions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const clearSubmissions = () => {
    setSubmissions([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { submissions, submitted, saveSubmission, clearSubmissions };
}
