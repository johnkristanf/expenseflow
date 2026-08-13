import { FormField } from '@/components/ui/form-dialog';

export const INCOME_FORM_FIELDS: FormField[] = [
  {
    name: 'source',
    label: 'Source',
    type: 'text',
    placeholder: 'e.g. Freelance work',
    required: true,
  },
  {
    name: 'amount',
    label: 'Amount',
    type: 'number',
    placeholder: '0.00',
    required: true,
  },
  {
    name: 'dateAcquired',
    label: 'Date Acquired',
    type: 'date',
    required: true,
  },
];
