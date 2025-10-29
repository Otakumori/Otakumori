import React from 'react';

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: (props: { id: string; describedBy?: string; ariaInvalid?: boolean }) => React.ReactNode;
};

export function FormField({ id, label, hint, error, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;

  const childProps: { id: string; describedBy?: string; ariaInvalid?: boolean } = {
    id,
    ariaInvalid: !!error,
  };
  if (describedBy) {
    childProps.describedBy = describedBy;
  }

  return (
    <div>
      <label htmlFor={id}>
        {label}
        {error && <span aria-hidden="true"> *</span>}
      </label>
      {hint && <p id={hintId}>{hint}</p>}
      {children(childProps)}
      {error && (
        <p id={errId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
