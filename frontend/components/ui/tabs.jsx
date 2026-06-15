"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

const TabsCtx = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className, children }) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const setActive = (v) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsCtx.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-sand bg-paper p-1", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }) {
  const { active, setActive } = useContext(TabsCtx);
  const isActive = active === value;
  return (
    <button
      onClick={() => setActive(value)}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition-all",
        isActive ? "bg-emerald-800 text-paper-soft shadow-soft" : "text-ink-muted hover:text-emerald-800",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const { active } = useContext(TabsCtx);
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
}
