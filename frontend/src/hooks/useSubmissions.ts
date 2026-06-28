'use client';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'form_demo_submissions';

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Record<string, string>[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSubmissions(JSON.parse(stored));
    } catch {
      // corrupted localStorage — start fresh
    }
  }, []);

  const saveSubmission = (values: Record<string, string>) => {
    const next = [values, ...submissions];
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
