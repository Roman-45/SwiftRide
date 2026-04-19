import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  raised?: boolean;
  as?: 'div' | 'section' | 'article';
  children?: ReactNode;
}

export function Card({ padding = 'md', raised, className, children, ...rest }: CardProps) {
  const pad = padding === 'none' ? '' : padding === 'sm' ? 'p-4' : padding === 'lg' ? 'p-6 sm:p-8' : 'p-5';
  const cls = ['sr-card', raised && 'sr-card--raised', pad, className].filter(Boolean).join(' ');
  return <div className={cls} {...rest}>{children}</div>;
}

interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  action?: ReactNode;
}
export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div className="p-5 border-b border-line flex items-end justify-between gap-3 flex-wrap">
      <div>
        {eyebrow && <div className="sr-eyebrow mb-1">{eyebrow}</div>}
        <div className="font-serif text-[22px] tracking-tight">{title}</div>
      </div>
      {action}
    </div>
  );
}
