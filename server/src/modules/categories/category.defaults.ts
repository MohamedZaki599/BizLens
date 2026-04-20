import type { TransactionType, UserMode } from '@prisma/client';

export interface DefaultCategorySeed {
  name: string;
  type: TransactionType;
  color?: string;
}

/**
 * Mode-specific default categories that are seeded for every new account.
 * Keep these tight and meaningful — too many up-front options dilutes the
 * "instant clarity" promise.
 */
export const DEFAULT_CATEGORIES: Record<UserMode, DefaultCategorySeed[]> = {
  FREELANCER: [
    { name: 'Client Project', type: 'INCOME', color: '#43ecdb' },
    { name: 'Consulting', type: 'INCOME', color: '#7c5cff' },
    { name: 'Royalties', type: 'INCOME', color: '#ffb691' },
    { name: 'Software & Tools', type: 'EXPENSE', color: '#c1c1ff' },
    { name: 'Marketing', type: 'EXPENSE', color: '#ff7eb0' },
    { name: 'Travel', type: 'EXPENSE', color: '#f5b14a' },
    { name: 'Taxes', type: 'EXPENSE', color: '#ff6b6b' },
  ],
  ECOMMERCE: [
    { name: 'Product Sales', type: 'INCOME', color: '#43ecdb' },
    { name: 'Shipping Income', type: 'INCOME', color: '#a3e635' },
    { name: 'Cost of Goods', type: 'EXPENSE', color: '#ff6b6b' },
    { name: 'Ads & Marketing', type: 'EXPENSE', color: '#ff7eb0' },
    { name: 'Platform Fees', type: 'EXPENSE', color: '#c1c1ff' },
    { name: 'Shipping Expenses', type: 'EXPENSE', color: '#f5b14a' },
    { name: 'Packaging', type: 'EXPENSE', color: '#ffb691' },
  ],
  SERVICE_BUSINESS: [
    { name: 'Service Revenue', type: 'INCOME', color: '#43ecdb' },
    { name: 'Recurring Retainer', type: 'INCOME', color: '#7c5cff' },
    { name: 'Salaries', type: 'EXPENSE', color: '#ff6b6b' },
    { name: 'Rent & Utilities', type: 'EXPENSE', color: '#c1c1ff' },
    { name: 'Software', type: 'EXPENSE', color: '#a3e635' },
    { name: 'Marketing', type: 'EXPENSE', color: '#ff7eb0' },
    { name: 'Travel', type: 'EXPENSE', color: '#f5b14a' },
  ],
};
