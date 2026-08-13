import { FormField } from '@/components/ui/form-dialog';

export const CATEGORY_FORM_FIELDS: FormField[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'e.g. Groceries',
    required: true,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'text',
    placeholder: 'Optional description…',
  },
];
