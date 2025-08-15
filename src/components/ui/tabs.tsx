'use client';

import * as React from 'react';

type TabsContextValue = { value: string, setValue: (v:string)=>void };
const Ctx = React.createContext<TabsContextValue | null>(null);

export function Tabs({ value, onValueChange, children }:{value:string, onValueChange:(v:string)=>void, children:React.ReactNode}) {
  return <Ctx.Provider value={{ value, setValue: onValueChange }}>{children}</Ctx.Provider>;
}
export function TabsList({ children }:{children:React.ReactNode}) {
  return <div className="flex gap-2">{children}</div>;
}
export function TabsTrigger({ value, children }:{value:string, children:React.ReactNode}) {
  const ctx = React.useContext(Ctx)!;
  const active = ctx.value === value;
  return (
    <button onClick={()=>ctx.setValue(value)} className={`px-3 py-1 rounded-md border text-sm ${active?'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]':''}`}>
      {children}
    </button>
  );
}
export function TabsContent({ value, children }:{value:string, children:React.ReactNode}) {
  const ctx = React.useContext(Ctx)!;
  if (ctx.value !== value) return null;
  return <div className="mt-4">{children}</div>;
}

