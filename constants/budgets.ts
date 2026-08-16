import { FormField } from "@/components/ui/form-dialog"

export const BUDGET_FORM_FIELDS: FormField[] = [
  {
    name: "name",
    label: "Budget Name",
    type: "text",
    placeholder: "e.g. Groceries",
    required: true,
  },
  {
    name: "totalAmount",
    label: "Total Amount",
    type: "number",
    placeholder: "0.00",
    required: true,
  },
]

export const budgetBaseFields = BUDGET_FORM_FIELDS
