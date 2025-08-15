'use client';

import * as React from 'react';

/**
 * Select accesible y estilizado (no usa <select> nativo).
 * - Totalmente controlado por props: value, onChange
 * - Acepta children <option value="...">Label</option> para compatibilidad
 * - Teclado: ↑ ↓ Enter/Espacio, Escape, Home/End, PageUp/PageDown
 * - ARIA: button + listbox + options
 *
 * Uso compatible actual:
 *   <Select value={value} onChange={e => setValue(e.target.value)}>
 *     <option value="C">C</option>
 *     <option value="G">G</option>
 *   </Select>
 */

type HTMLSelectChange = React.ChangeEvent<HTMLSelectElement>;

export type SelectProps = {
  value?: string;
  onChange?: (e: HTMLSelectChange) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode; // se esperan <option>
};

type Option = { value: string; label: string; disabled?: boolean };

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function extractOptions(children: React.ReactNode): Option[] {
  const out: Option[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = (child as any).type;
    // Permitimos <option> y también elementos con props {value, children}
    if (type === 'option' || (child.props && 'value' in child.props)) {
      out.push({
        value: String(child.props.value ?? ''),
        label: String(child.props.children ?? String(child.props.value ?? '')),
        disabled: !!child.props.disabled,
      });
    }
  });
  return out;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ value, onChange, placeholder = 'Seleccionar…', disabled, className, children }, ref) => {
    const options = React.useMemo(() => extractOptions(children), [children]);
    const selected = options.find((o) => o.value === value) ?? null;

    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(
      Math.max(0, options.findIndex((o) => o.value === value))
    );
    const btnRef = React.useRef<HTMLButtonElement | null>(null);
    React.useImperativeHandle(ref, () => btnRef.current as HTMLButtonElement);

    const listRef = React.useRef<HTMLUListElement | null>(null);

    const close = React.useCallback(() => setOpen(false), []);
    const openMenu = React.useCallback(() => {
      setOpen(true);
      setTimeout(() => {
        const el = listRef.current?.querySelector<HTMLElement>('[data-highlighted="true"]');
        el?.scrollIntoView({ block: 'nearest' });
      }, 0);
    }, []);

    React.useEffect(() => {
      function onDocClick(e: MouseEvent) {
        if (!open) return;
        const t = e.target as Node;
        if (!btnRef.current?.contains(t) && !listRef.current?.contains(t)) {
          setOpen(false);
        }
      }
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }, [open]);

    function emitChange(newVal: string) {
      if (!onChange) return;
      // Fabricamos un evento con target.value para compatibilidad
      const evt = {
        target: { value: newVal },
      } as unknown as HTMLSelectChange;
      onChange(evt);
    }

    function onSelect(idx: number) {
      const opt = options[idx];
      if (!opt || opt.disabled) return;
      emitChange(opt.value);
      setActiveIndex(idx);
      close();
      btnRef.current?.focus();
    }

    function onKeyDown(e: React.KeyboardEvent) {
      if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        openMenu();
        return;
      }
      if (!open) return;

      if (e.key === 'Escape') { e.preventDefault(); close(); btnRef.current?.focus(); return; }

      const max = options.length - 1;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(max, i + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Home') {
        e.preventDefault(); setActiveIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault(); setActiveIndex(max);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); onSelect(activeIndex);
      }
      // Scroll activo a la vista
      setTimeout(() => {
        const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
        el?.scrollIntoView({ block: 'nearest' });
      }, 0);
    }

    return (
      <div className={cx('vm-dropdown', className)}>
        {/* Trigger */}
        <button
          ref={btnRef}
          type="button"
          className="vm-trigger flex items-center justify-between"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => (open ? close() : openMenu())}
          onKeyDown={onKeyDown}
          disabled={disabled}
        >
          <span className={cx('truncate', !selected && 'opacity-60')}>
            {selected ? selected.label : placeholder}
          </span>
          <svg
            className="ml-2 h-4 w-4 opacity-60"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
          </svg>
        </button>

        {/* Menu */}
        {open && (
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="vm-menu"
            onKeyDown={onKeyDown}
          >
            {options.map((opt, i) => {
              const highlighted = i === activeIndex;
              const selected = value === opt.value;
              return (
                <li
                  key={opt.value + i}
                  role="option"
                  aria-selected={selected}
                  data-selected={selected ? 'true' : 'false'}
                  data-highlighted={highlighted ? 'true' : 'false'}
                  data-index={i}
                  className="vm-item"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(i)}
                >
                  <span className="truncate">{opt.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export default Select;
