// lib/solcitos-config.ts
export const SOLCITO_PACKAGES = [
  {
    id: 'pack-95',
    name: '95 Solcitos',
    amount: 95,
    price: 1.99,
    bonus: 0,
    popular: false
  },
  {
    id: 'pack-245',
    name: '245 Solcitos',
    amount: 245,
    price: 2.99,
    bonus: 0,
    popular: false
  },
  {
    id: 'pack-510',
    name: '510 Solcitos',
    amount: 510,
    price: 4.99,
    bonus: 0,
    popular: false
  },
  {
    id: 'pack-1050',
    name: '1,050 Solcitos',
    amount: 1050,
    price: 8.99,
    bonus: 0,
    popular: true
  },
  {
    id: 'pack-2750',
    name: '2,750 Solcitos',
    amount: 2750,
    price: 10.99,
    bonus: 100, // Bonus!
    popular: false
  },
  {
    id: 'pack-5550',
    name: '5,550 Solcitos',
    amount: 5550,
    price: 15.99,
    bonus: 250,
    popular: false
  },
  {
    id: 'pack-11500',
    name: '11,500 Solcitos',
    amount: 11500,
    price: 20.99,
    bonus: 500,
    popular: false
  }
];

export const PLATFORM_FEE = {
  SOLCITOS: 0.03,      // 3% comisión en solcitos
  DONATIONS: 0.08,     // 8% comisión en donaciones
  SUBSCRIPTIONS: 0.30, // 30% comisión en suscripciones
};