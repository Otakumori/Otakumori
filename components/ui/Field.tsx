interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ id, label, hint, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
