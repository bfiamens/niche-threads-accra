import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { z } from 'zod';

export type CartLine = { productId: string; size: string; qty: number };
type CartCtx = {
  lines: CartLine[];
  add: (l: CartLine) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  remove: (productId: string, size: string) => void;
  replace: (lines: CartLine[]) => void;
  clear: () => void;
  count: number;
};
const Ctx = createContext<CartCtx | null>(null);
const KEY = "niche-bag-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = z.array(z.object({productId:z.string().min(1).max(80),size:z.string().max(20),qty:z.number().int().min(1).max(20)})).max(100).safeParse(JSON.parse(raw));
        if(parsed.success) setLines(parsed.data);
      }
    } catch { /* ignore broken storage */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) window.localStorage.setItem(KEY, JSON.stringify(lines)); }, [lines, ready]);

  const same = (a: CartLine, id: string, size: string) => a.productId === id && a.size === size;
  const value: CartCtx = {
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    add: (l) => setLines((cur) => {
      const ex = cur.find((c) => same(c, l.productId, l.size));
      return ex ? cur.map((c) => (c === ex ? { ...c, qty: c.qty + l.qty } : c)) : [...cur, l];
    }),
    setQty: (id, size, qty) => setLines((cur) => cur.map((c) => (same(c, id, size) ? { ...c, qty: Math.max(1, qty) } : c))),
    remove: (id, size) => setLines((cur) => cur.filter((c) => !same(c, id, size))),
    replace: setLines,
    clear: () => setLines([]),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
