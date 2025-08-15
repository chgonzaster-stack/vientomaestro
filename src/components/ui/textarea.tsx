import * as React from 'react';
import { cn } from '../utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return <textarea ref={ref} className={cn('w-full rounded-md border bg-transparent p-2 outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] min-h-48', className)} {...props} />;
});
Textarea.displayName = 'Textarea';
