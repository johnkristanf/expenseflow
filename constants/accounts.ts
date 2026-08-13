import { FormField } from '@/components/ui/form-dialog';

export const ACCOUNT_TYPES = [
  { label: 'Cash', value: 'cash' },
  { label: 'Savings', value: 'savings' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Investment', value: 'investment' },
  { label: 'Other', value: 'other' },
];

export const ACCOUNT_FORM_FIELDS: FormField[] = [
  {
    name: 'name',
    label: 'Account Name',
    type: 'text',
    placeholder: 'e.g. BDO Savings',
    required: true,
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    placeholder: 'Select account type…',
    required: true,
    options: ACCOUNT_TYPES,
  },
  {
    name: 'balance',
    label: 'Balance',
    type: 'number',
    placeholder: '0.00',
    required: true,
  },
];
