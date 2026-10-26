import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode;
}

function FieldShell({ label, error, hint, optional, className = '', children }: FieldShellProps) {
  const id = useId();
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {optional && <span className="field__optional">Optional</span>}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="field__hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

type InputFieldProps = Omit<FieldShellProps, 'children'> & InputHTMLAttributes<HTMLInputElement>;

export function InputField({ label, error, hint, optional, className, ...input }: InputFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={className}>
      {(a11y) => <input className="input" {...a11y} {...input} />}
    </FieldShell>
  );
}

type SelectFieldProps = Omit<FieldShellProps, 'children'> & SelectHTMLAttributes<HTMLSelectElement>;

export function SelectField({ label, error, hint, optional, className, children, ...select }: SelectFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={className}>
      {(a11y) => (
        <select className="input select" {...a11y} {...select}>
          {children}
        </select>
      )}
    </FieldShell>
  );
}
