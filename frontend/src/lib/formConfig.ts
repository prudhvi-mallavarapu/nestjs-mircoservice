import type { FieldConfig } from '@/types';

export const formConfig: FieldConfig[] = [
  {
    id: 1,
    name: 'Full Name',
    fieldType: 'TEXT',
    minLength: 1,
    maxLength: 100,
    defaultValue: 'John Doe',
    required: true,
  },
  {
    id: 2,
    name: 'Email',
    fieldType: 'TEXT',
    minLength: 1,
    maxLength: 50,
    defaultValue: 'hello@mail.com',
    required: true,
  },
  {
    id: 6,
    name: 'Gender',
    fieldType: 'LIST',
    defaultValue: 'Male',
    required: true,
    listOfValues: ['Male', 'Female', 'Others'],
  },
  {
    id: 7,
    name: 'Love React?',
    fieldType: 'RADIO',
    defaultValue: 'Yes',
    required: true,
    listOfValues: ['Yes', 'No'],
  },
];
