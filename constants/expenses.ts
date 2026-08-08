import { FormField } from "@/components/ui/form-dialog"
import { Category } from "@/lib/api/categories"
import { Budget } from "@/lib/api/budgets"

export const SPENDING_TYPES = [
  { label: "NEEDS", value: "NEEDS" },
  { label: "WANTS", value: "WANTS" },
]

export const getExpenseFormFields = (
  categories: Category[],
  budgets: Budget[]
): FormField[] => [
  {
    name: "description",
    label: "Description",
    type: "text",
    placeholder: "e.g. Grocery run",
    required: true,
  },
  {
    name: "amount",
    label: "Amount",
    type: "number",
    placeholder: "0.00",
    required: true,
  },
  {
    name: "dateSpent",
    label: "Date Spent",
    type: "date",
    required: true,
  },
  {
    name: "spendingType",
    label: "Spending Type",
    type: "select",
    placeholder: "Select a type…",
    required: true,
    options: SPENDING_TYPES,
  },
  {
    name: "categoryId",
    label: "Category",
    type: "select",
    placeholder: "Select a category…",
    required: true,
    options: categories.map((c) => ({
      label: c.name,
      value: String(c.id),
    })),
  },
  {
    name: "budgetId",
    label: "Budget",
    type: "select",
    placeholder: "Select a budget…",
    required: true,
    options: budgets.map((b) => ({
      label: b.name,
      value: String(b.id),
    })),
  },
]
