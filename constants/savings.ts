import { FormField } from '@/components/ui/form-dialog';

export const SAVINGS_FORM_FIELDS: FormField[] = [
  {
    name: 'goalName',
    label: 'Goal Name',
    type: 'text',
    placeholder: 'e.g. Emergency Fund',
    required: true,
  },
  {
    name: 'targetAmount',
    label: 'Target Amount',
    type: 'number',
    placeholder: '0.00',
    required: true,
  },
  {
    name: 'startDate',
    label: 'Start Date',
    type: 'date',
    required: true,
  },
  {
    name: 'targetDate',
    label: 'Target Date',
    type: 'date',
    required: true,
  },
];
