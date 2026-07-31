export interface LineItem {
  description: string;
  quantity: number;
  unitPriceCents: number;
  vatRate: number; // ex: 20 pour 20%
}

export interface Totals {
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  vatBreakdown: { rate: number; baseCents: number; vatCents: number }[];
}

export function computeTotals(items: LineItem[]): Totals {
  const vatMap = new Map<number, { baseCents: number; vatCents: number }>();
  let subtotalCents = 0;

  for (const item of items || []) {
    const lineTotal = Math.round(item.quantity * item.unitPriceCents);
    subtotalCents += lineTotal;
    const rate = item.vatRate ?? 0;
    const lineVat = Math.round((lineTotal * rate) / 100);
    const entry = vatMap.get(rate) || { baseCents: 0, vatCents: 0 };
    entry.baseCents += lineTotal;
    entry.vatCents += lineVat;
    vatMap.set(rate, entry);
  }

  const vatBreakdown = Array.from(vatMap.entries()).map(([rate, v]) => ({
    rate,
    baseCents: v.baseCents,
    vatCents: v.vatCents,
  }));
  const vatCents = vatBreakdown.reduce((sum, v) => sum + v.vatCents, 0);

  return {
    subtotalCents,
    vatCents,
    totalCents: subtotalCents + vatCents,
    vatBreakdown,
  };
}
