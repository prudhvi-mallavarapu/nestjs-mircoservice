'use client';
import { useState } from 'react';
import { formConfig as initialConfig } from '@/lib/formConfig';
import type { FieldConfig } from '@/types';

function validateConfig(parsed: unknown): string | null {
  if (!Array.isArray(parsed)) return 'Config must be a JSON array';
  for (const item of parsed as Record<string, unknown>[]) {
    if (item.id == null) return 'Each field must have an id';
    if (!item.name) return 'Each field must have a name';
    if (!['TEXT', 'LIST', 'RADIO'].includes(item.fieldType as string))
      return 'fieldType must be TEXT, LIST, or RADIO';
    if (['LIST', 'RADIO'].includes(item.fieldType as string) &&
        (!Array.isArray(item.listOfValues) || (item.listOfValues as unknown[]).length === 0))
      return `"${item.name}" requires listOfValues for ${item.fieldType} type`;
    if (['LIST', 'RADIO'].includes(item.fieldType as string) &&
        item.defaultValue != null &&
        !(item.listOfValues as string[]).includes(item.defaultValue as string))
      return `"${item.name}" defaultValue "${item.defaultValue}" is not in listOfValues`;
  }
  return null;
}

function configSig(fields: FieldConfig[]): string {
  return JSON.stringify(fields.map((f) => ({
    id: f.id, fieldType: f.fieldType, defaultValue: f.defaultValue ?? '', listOfValues: f.listOfValues ?? [],
  })));
}

export function buildDefaults(fields: FieldConfig[]): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [String(f.id), f.defaultValue ?? '']));
}

export function useJsonConfig(
  onValidConfigChange: (next: FieldConfig[], defaults: Record<string, string>) => void
) {
  const [config, setConfig] = useState<FieldConfig[]>(initialConfig);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(initialConfig, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      const err = validateConfig(parsed);
      if (err) { setJsonError(err); return; }
      const next = parsed as FieldConfig[];
      if (configSig(config) !== configSig(next)) {
        onValidConfigChange(next, buildDefaults(next));
      }
      setConfig(next);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  const resetJson = () => {
    const text = JSON.stringify(initialConfig, null, 2);
    setJsonText(text);
    setConfig(initialConfig);
    setJsonError(null);
    onValidConfigChange(initialConfig, buildDefaults(initialConfig));
  };

  return { config, jsonText, jsonError, handleJsonChange, resetJson };
}
