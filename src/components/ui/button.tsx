import * as React from 'react';
import { cn } from '../utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant='default', size='md', ...props }, ref) => {
    const variants: Record<string,string> = {
      default: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline: 'border bg-transparent hover:bg-black/5',
      ghost: 'bg-transparent hover:bg-black/5'
    };
    const sizes: Record<string,string> = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-sm'
    };
    return (
      <button
        ref={ref}
        className={cn('inline-flex items-center gap-2 rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none', variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
