import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: (ids: { inputId: string; invalid: boolean }) => ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  const inputId = useId();
  const invalid = !!error;
  return (
    <div className="sr-field mb-3">
      <label className="sr-label" htmlFor={inputId}>{label}</label>
      {children({ inputId, invalid })}
      {error ? (
        <div className="text-[12px] text-err">{error}</div>
      ) : hint ? (
        <div className="text-[12px] text-ink-4">{hint}</div>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(({ invalid, className, ...rest }, ref) => (
  <input ref={ref} className={['sr-input', className].filter(Boolean).join(' ')} aria-invalid={invalid || undefined} {...rest} />
));
Input.displayName = 'Input';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ invalid, className, ...rest }, ref) => (
  <textarea ref={ref} className={['sr-input', className].filter(Boolean).join(' ')} aria-invalid={invalid || undefined} {...rest} />
));
Textarea.displayName = 'Textarea';
