'use client';

import * as React from 'react';

type Toast = { id: number; title?: string; description?: string; variant?: 'default'|'destructive' };
const ToastCtx = React.createContext<{ toast: (t: Omit<Toast,'id'>)=>void } | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <Toaster />');
  return ctx;
}

export function Toaster({ children }:{children?: React.ReactNode}) {
  const [items, setItems] = React.useState<Toast[]>([]);
  const toast = (t: Omit<Toast,'id'>) => {
    const id = Date.now();
    setItems(prev => [...prev, { id, ...t }]);
    setTimeout(()=> setItems(prev => prev.filter(i=>i.id!==id)), 2500);
  };
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {items.map(i => (
          <div key={i.id} className={`rounded-md border px-3 py-2 text-sm shadow ${i.variant==='destructive'?'border-red-500 text-red-100 bg-red-900/40':'bg-black/60 text-white border-white/20'}`}>
            {i.title && <div className="font-semibold">{i.title}</div>}
            {i.description && <div className="opacity-90">{i.description}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
