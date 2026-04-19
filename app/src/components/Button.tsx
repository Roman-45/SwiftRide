import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', block, iconLeft, iconRight, className, children, ...rest }, ref) => {
    const cls = [
      'sr-btn',
      `sr-btn--${variant}`,
      size === 'sm' && 'sr-btn--sm',
      size === 'lg' && 'sr-btn--lg',
      block && 'sr-btn--block',
      className,
    ].filter(Boolean).join(' ');
    return (
      <button ref={ref} className={cls} {...rest}>
        {iconLeft}
        {children}
        {iconRight}
      </button>
    );
  },
);
Button.displayName = 'Button';
