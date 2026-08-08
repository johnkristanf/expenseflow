"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

// ─── Field definitions ────────────────────────────────────────────────────────

export interface FormField {
  /** Unique key for the field — doubles as the form data key */
  name: string
  label: string
  type: "text" | "number" | "date" | "textarea" | "select" | "custom"
  placeholder?: string
  required?: boolean
  /** For type = "select" */
  options?: { label: string; value: string }[]
  /** For type = "custom" — render your own element; receives value + onChange */
  render?: (value: string, onChange: (val: string) => void) => React.ReactNode
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FormDialogProps {
  /** The element that opens the dialog (e.g. a Button) */
  trigger: React.ReactNode
  title: string
  description?: string
  fields: FormField[]
  /** Default values keyed by field.name */
  defaultValues?: Record<string, string>
  submitLabel?: string
  cancelLabel?: string
  /**
   * Called when the user submits. Return `true` (or a resolved promise) to
   * close the dialog automatically; return `false` / throw to keep it open.
   */
  onSubmit: (data: Record<string, string>) => Promise<boolean> | boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormDialog({
  trigger,
  title,
  description,
  fields,
  defaultValues = {},
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onSubmit,
}: FormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)

  // Initialise / reset field values whenever the dialog opens
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {}
      fields.forEach((f) => {
        initial[f.name] = defaultValues[f.name] ?? ""
      })
      setValues(initial)
      setErrors({})
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const setValue = (name: string, val: string) =>
    setValues((prev) => ({ ...prev, [name]: val }))

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    fields.forEach((f) => {
      if (f.required && !values[f.name]?.trim()) {
        next[f.name] = `${f.label} is required.`
      }
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const ok = await onSubmit(values)
      if (ok) setOpen(false)
    } catch {
      // Errors are handled upstream; keep dialog open
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={React.isValidElement(trigger) ? trigger : <Button>{trigger}</Button>} />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4 py-2">
            {fields.map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && (
                    <span className="ml-0.5 text-destructive">*</span>
                  )}
                </Label>

                <FieldInput
                  field={field}
                  value={values[field.name] ?? ""}
                  onChange={(val) => setValue(field.name, val)}
                />

                {errors[field.name] && (
                  <p className="text-xs text-destructive">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="mt-4" showCloseButton={false}>
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={loading} />
              }
            >
              {cancelLabel}
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Internal field renderer ──────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FormField
  value: string
  onChange: (val: string) => void
}) {
  const base =
    "h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

  if (field.type === "textarea") {
    return (
      <textarea
        id={field.name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className={`${base} h-auto resize-none py-2`}
      />
    )
  }

  if (field.type === "select" && field.options) {
    return (
      <select
        id={field.name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} cursor-pointer`}
      >
        <option value="" disabled>
          {field.placeholder ?? `Select ${field.label}…`}
        </option>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  if (field.type === "custom" && field.render) {
    return <>{field.render(value, onChange)}</>
  }

  return (
    <input
      id={field.name}
      type={field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={base}
    />
  )
}
