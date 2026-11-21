import type { Product } from './store';

export const STYLE_KEYS = ['classic', 'streetwear', 'athletic', 'evening'] as const;
export type StyleKey = typeof STYLE_KEYS[number];
const WORDS: Record<StyleKey, string[]> = {
  classic: ['polo', 'pleat', 'leather', 'watch'],
  streetwear: ['tee', 'jersey', 'sneaker', 'shorts'],
  athletic: ['runner', 'shorts', 'jersey', 'tee'],
  evening: ['pleat', 'polo', 'leather', 'watch'],
};

// Stock is per product, not per size; exclude pre-orders from ready-to-wear looks.
export function styleScore(p: Product, style: StyleKey) {
  if (p.style_tags.length) return p.style_tags.includes(style) ? 10 : 0;
  const name = p.name_en.toLowerCase();
  return WORDS[style].reduce((n, word) => n + (name.includes(word) ? 1 : 0), 0);
}

export function buildLook(products: Product[], style: StyleKey, anchor?: Product) {
  const available = products.filter(p => p.published && p.stock > 0 && !p.preorder);
  const categories = ['Tops', 'Bottoms', 'Shoes', 'Accessories'];
  return categories.flatMap(category => {
    if (anchor?.category === category) return anchor.stock > 0 && !anchor.preorder ? [anchor] : [];
    const options = available.filter(p => p.category === category)
      .sort((a,b) => styleScore(b, style) - styleScore(a, style) || a.sort - b.sort);
    return options[0] ? [options[0]] : [];
  });
}

export function lookTotal(products: Product[]) { return products.reduce((n,p) => n + Number(p.price_ghs), 0); }
export function salesSummary(orders: { status: string; subtotal: number; total: number }[]) {
  const paid = orders.filter(o => ['paid','shipped','delivered'].includes(o.status));
  return { revenue: paid.reduce((n,o) => n + Number(o.subtotal), 0), paidOrders: paid.length,
    pending: orders.filter(o => ['awaiting_payment','payment_submitted'].includes(o.status)).length };
}