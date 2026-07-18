import { cn } from '@/lib/utils';

type CardVariant = 'flat' | 'elevated';

export function Card({
  className,
  variant = 'flat',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: CardVariant }) {
  return (
    <div
      className={cn(
        'rounded-3xl',
        variant === 'elevated' ? 'glass-panel' : 'surface-panel',
        className
      )}
      {...props}
    />
  );
}