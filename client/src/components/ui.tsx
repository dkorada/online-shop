import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Spinner({ size = 18, label }: { size?: number; label?: string }) {
  return (
    <span className="spinner" role={label ? 'status' : undefined}>
      <Loader2 size={size} className="spin" aria-hidden />
      {label && <span className="visually-hidden">{label}</span>}
    </span>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg' | 'sm';
  loading?: boolean;
  block?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, block, children, disabled, className, ...rest }: ButtonProps) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className].filter(Boolean).join(' ');
  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Spinner size={size === 'sm' ? 14 : 18} />}
      {children}
    </button>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div className="state-panel" role="alert">
      <div className="state-panel__icon state-panel__icon--error">
        <AlertTriangle size={26} aria-hidden />
      </div>
      <h2>{title}</h2>
      {message && <p className="muted">{message}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden /> Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="state-panel">
      <div className="state-panel__icon">{icon}</div>
      <h2>{title}</h2>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`skeleton ${className}`} aria-hidden />;
}
