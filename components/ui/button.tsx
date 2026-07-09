import { cloneElement, isValidElement } from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'default' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
  secondary: 'bg-white/8 text-white hover:bg-white/12 border border-white/10',
  ghost: 'bg-transparent text-slate-200 hover:bg-white/8',
  outline: 'border border-white/12 bg-transparent text-white hover:bg-white/8'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  default: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base'
};

export function Button({ className, variant = 'default', size = 'default', asChild, children, ...props }: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: cn((children.props as { className?: string }).className, classes),
      suppressHydrationWarning: true
    } as React.Attributes & { className?: string });
  }

  return (
    <button className={classes} suppressHydrationWarning {...props}>
      {children}
    </button>
  );
}