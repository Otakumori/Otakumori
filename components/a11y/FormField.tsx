import React from "react";

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: (props: {
    id: string;
    describedBy?: string;
    ariaInvalid?: boolean;
  }) => React.ReactNode;
};

export function FormField({ id, label, hint, error, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id}>
        {label}
        {error && <span aria-hidden="true"> *</span>}
      </label>
      {hint && <p id={hintId}>{hint}</p>}
      {children({ id, describedBy, ariaInvalid: !!error })}
      {error && (
        <p id={errId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
