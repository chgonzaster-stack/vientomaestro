// src/components/ui/select.tsx
'use client';

import * as React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = RadixSelect.Root;
export const SelectValue = RadixSelect.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>) {
  return (
    <RadixSelect.Trigger
      {...props}
      className={cn(
        'inline-flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm',
        'outline-none ring-0 focus-visible:ring-2 focus-visible:ring-primary/40',
        className
      )}
    >
      {children}
      <RadixSelect.Icon className="ml-2">
        <ChevronDown className="h-4 w-4 opacity-70" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

/**
 * Content flotante con Popper + Portal.
 * Usa ancho del trigger y z-index alto para evitar recortes.
 */
export function SelectContent({
  className,
  children,
  position = 'popper',
  sideOffset = 8,
  align = 'start',
  ...props
}: Omit<
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>,
  'position'
> & {
  position?: 'item-aligned' | 'popper';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        align={align}
        position={position}
        sideOffset={sideOffset}
        {...props}
        className={cn(
          'z-[9999] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
          // igualar ancho al trigger
          'min-w-[var(--radix-select-trigger-width)] w-[var(--radix-select-trigger-width)]',
          // animación popper
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
      >
        <RadixSelect.Viewport className="p-1">
          {children}
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixSelect.Item>) {
  return (
    <RadixSelect.Item
      {...props}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
    >
      <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
        <RadixSelect.ItemIndicator>
          <Check className="h-4 w-4" />
        </RadixSelect.ItemIndicator>
      </span>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}
