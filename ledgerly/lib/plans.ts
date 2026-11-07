import { formatUsd } from "@/lib/money";

export const PLAN_IDS = ["STARTER", "GROWTH", "SCALE"] as const;

export type PlanId = (typeof PLAN_IDS)[number];

/**
 * Catalog prices are frozen. Demos must never invent a fourth price.
 * Cents only — format at the edge with formatUsd.
 */
export const PLAN_PRICE_CENTS: Record<PlanId, number> = {
  STARTER: 4900,
  GROWTH: 9900,
  SCALE: 24900,
};

export const PLAN_LABEL: Record<PlanId, string> = {
  STARTER: "Starter",
  GROWTH: "Growth",
  SCALE: "Scale",
};

export function isPlanId(value: string): value is PlanId {
  return (PLAN_IDS as readonly string[]).includes(value);
}

export function planPriceCents(plan: string): number {
  if (!isPlanId(plan)) {
    throw new Error(`Unknown plan "${plan}". Catalog is Starter $49, Growth $99, Scale $249.`);
  }
  return PLAN_PRICE_CENTS[plan];
}

export function planLabel(plan: string): string {
  if (!isPlanId(plan)) {
    throw new Error(`Unknown plan "${plan}".`);
  }
  return PLAN_LABEL[plan];
}

export const AMOUNTS_MASKED_LABEL = "Upgrade to view amounts";

/** Dollar figures show only on the paid catalog. Data entry (payment confirm) is the exception. */
export function amountsVisible(plan: string): boolean {
  return isPlanId(plan);
}

export function formatPlanAmount(plan: string, cents: number): string {
  return amountsVisible(plan) ? formatUsd(cents) : AMOUNTS_MASKED_LABEL;
}

/** Masks a formatted amount inside generated copy, such as a Nudge body. */
export function maskPlanAmountIn(plan: string, text: string, cents: number | null): string {
  if (amountsVisible(plan) || cents == null) return text;
  return text.replaceAll(formatUsd(cents), AMOUNTS_MASKED_LABEL);
}

export function planDisplayName(plan: string): string {
  return isPlanId(plan) ? PLAN_LABEL[plan] : plan;
}
