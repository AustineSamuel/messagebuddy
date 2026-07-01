/**
 * Credits & billing constants.
 *
 * @see docs/credits-and-analytics.md
 */
export const SIGNUP_CREDITS = 5000
export const CREDITS_PER_MESSAGE = 0.5
/** Credits purchased per checkout unit (100 credits = ₦1,000). */
export const PURCHASE_CREDITS_UNIT = 100
export const PURCHASE_NGN_PER_UNIT = 1000

export const PURCHASE_PACKAGES = [
  { credits: 100, priceNgn: 1000, label: 'Starter' },
  { credits: 500, priceNgn: 5000, label: 'Growth' },
  { credits: 1000, priceNgn: 10000, label: 'Pro' },
  { credits: 2500, priceNgn: 25000, label: 'Business' },
  { credits: 5000, priceNgn: 50000, label: 'Scale' },
] as const
