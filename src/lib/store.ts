import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Locale } from "./i18n";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Settings = Database["public"]["Tables"]["store_settings"]["Row"];
export type PolicyKey = "delivery" | "returns" | "privacy" | "terms" | "about";
export const POLICY_KEYS: PolicyKey[] = ["about", "delivery", "returns", "privacy", "terms"];
export const CATEGORIES = ["Tops", "Bottoms", "Shoes", "Accessories"] as const;
export type Policies = Partial<Record<PolicyKey, { en?: string; de?: string }>>;

export const money = (n: number | string) =>
  "GH₵" + Number(n).toLocaleString("en-GH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const productName = (p: Pick<Product, "name_en" | "name_de">, l: Locale) => (l === "de" && p.name_de) || p.name_en;
export const productDesc = (p: Pick<Product, "description_en" | "description_de">, l: Locale) =>
  (l === "de" && p.description_de) || p.description_en;

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase.from("products").select("*").eq("published", true).order("sort");
    if (error) throw error;
    return data;
  },
});
export const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).eq("published", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("get_store_settings");
    if (error || !data) throw error ?? new Error("Store settings unavailable.");
    return data as unknown as Settings;
  },
});

export const hasMomo = (s: Settings) => !!s.momo_number.trim();
export const hasBank = (s: Settings) => !!s.bank_account_number.trim() && !!s.bank_name.trim();

/** Whether the shop can take a Ghana order right now. */
export function checkoutReady(s: Settings) {
  return s.checkout_open && (hasMomo(s) || hasBank(s));
}

export function setupGaps(s: Settings, needsReview: number) {
  const gaps: string[] = [];
  if (!hasMomo(s) && !hasBank(s)) gaps.push("Add your Mobile Money number and/or bank account (Settings).");
  if (Number(s.kumasi_fee) <= 0 || Number(s.ghana_fee) <= 0) gaps.push("Set the delivery fees for Kumasi/KNUST and the rest of Ghana (Settings).");
  if (!s.contact_phone && !s.contact_whatsapp && !s.contact_email) gaps.push("Add at least one contact: phone, WhatsApp or email (Settings).");
  const pol = (s.policies ?? {}) as Policies;
  for (const k of POLICY_KEYS) for (const locale of ['en','de'] as const) if (!pol[k]?.[locale]?.trim()) gaps.push(`Write the “${k}” page in ${locale==='en'?'English':'German'} (Policies).`);
  if (needsReview > 0) gaps.push(`${needsReview} product(s) still carry sample prices/details — review each and untick “needs review” (Products).`);
  if (!s.checkout_open) gaps.push("Open checkout when everything above is done (Settings).");
  return gaps;
}
