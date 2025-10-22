export interface Tier {
  name: string;
  id: 'starter' | 'pro' | 'advanced';
  icon: string;
  description: string;
  features: string[];
  featured: boolean;
  priceId: Record<string, string>;
}

export const PricingTier: Tier[] = [
  {
    name: 'ColorKit',
    id: 'pro',
    icon: '/assets/icons/price-tiers/basic-icon.svg',
    description: 'Annual ColorKit Subscription with 7-day trial',
    features: ['Full access to all features', 'Annual billing', '7-day free trial'],
    featured: true,
    priceId: { month: 'pri_01k81t07rfhatra9vs6zf8831c', year: 'pri_01k81t07rfhatra9vs6zf8831c' },
  },
];
