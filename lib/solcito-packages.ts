// lib/solcito-packages.ts
// Solo datos, sin importar SDK de PayPal

export interface SolcitoPackage {
  id: string;
  name: string;
  amount: number;      // ✅ NUEVO: Solcitos base
  bonus: number;       // ✅ NUEVO: Solcitos bonus
  solcitos: number;    // Total (amount + bonus)
  priceUSD: number;
  popular?: boolean;
  discount?: number;
  icon: 'gem' | 'sparkles' | 'flame' | 'zap' | 'coins' | 'crown' | 'diamond';
}

// Paquetes de Solcitos (exportados para uso en cliente y servidor)
export const SOLCITO_PACKAGES: SolcitoPackage[] = [
  { 
    id: 'pack_95', 
    name: 'Inicio',
    amount: 95,
    bonus: 0,
    solcitos: 95,
    priceUSD: 1.99,
    icon: 'gem'
  },
  { 
    id: 'pack_245', 
    name: 'Básico',
    amount: 240,
    bonus: 5,
    solcitos: 245,
    priceUSD: 2.99,
    icon: 'sparkles'
  },
  { 
    id: 'pack_510', 
    name: 'Popular',
    amount: 495,
    bonus: 15,
    solcitos: 510,
    priceUSD: 4.99,
    popular: true,
    discount: 2,
    icon: 'flame'
  },
  { 
    id: 'pack_1050', 
    name: 'Grande',
    amount: 1000,
    bonus: 50,
    solcitos: 1050,
    priceUSD: 8.99,
    discount: 5,
    icon: 'zap'
  },
  { 
    id: 'pack_2750', 
    name: 'Mega',
    amount: 2600,
    bonus: 150,
    solcitos: 2750,
    priceUSD: 10.99,
    discount: 8,
    icon: 'coins'
  },
  { 
    id: 'pack_5550', 
    name: 'Ultra',
    amount: 5200,
    bonus: 350,
    solcitos: 5550,
    priceUSD: 15.99,
    discount: 12,
    icon: 'crown'
  },
  { 
    id: 'pack_11500', 
    name: 'Supremo',
    amount: 11000,
    bonus: 500,
    solcitos: 11500,
    priceUSD: 20.99,
    discount: 15,
    icon: 'diamond'
  }
];

// ============================================
// HELPERS
// ============================================

export function getPackageById(packageId: string): SolcitoPackage | undefined {
  return SOLCITO_PACKAGES.find(p => p.id === packageId);
}

export function calculateCommission(amount: number): number {
  return amount * 0.03; // 3% de comisión
}

export function calculateTotalSolcitos(amount: number, bonus: number): number {
  return amount + bonus;
}

export function getPackagesByPriceRange(minPrice: number, maxPrice: number): SolcitoPackage[] {
  return SOLCITO_PACKAGES.filter(
    pkg => pkg.priceUSD >= minPrice && pkg.priceUSD <= maxPrice
  );
}

export function getMostPopularPackage(): SolcitoPackage | undefined {
  return SOLCITO_PACKAGES.find(pkg => pkg.popular);
}

export function formatSolcitos(amount: number): string {
  return amount.toLocaleString('es-ES');
}

export function formatPrice(price: number, currency: 'USD' | 'ARS' = 'USD'): string {
  if (currency === 'USD') {
    return `$${price.toFixed(2)}`;
  }
  // Conversión aproximada para ARS (ajustar según tasa actual)
  const arsPrice = price * 1000; // Ejemplo: 1 USD = 1000 ARS
  return `$${arsPrice.toLocaleString('es-AR')} ARS`;
}

// ============================================
// VALIDACIÓN
// ============================================

export function validatePackage(packageId: string): {
  valid: boolean;
  package?: SolcitoPackage;
  error?: string;
} {
  const pkg = getPackageById(packageId);
  
  if (!pkg) {
    return {
      valid: false,
      error: 'Paquete no encontrado'
    };
  }

  if (pkg.priceUSD <= 0) {
    return {
      valid: false,
      error: 'Precio inválido'
    };
  }

  if (pkg.solcitos !== pkg.amount + pkg.bonus) {
    return {
      valid: false,
      error: 'Cálculo de solcitos incorrecto'
    };
  }

  return {
    valid: true,
    package: pkg
  };
}

// ============================================
// ESTADÍSTICAS
// ============================================

export function getPackageStats() {
  return {
    total: SOLCITO_PACKAGES.length,
    cheapest: SOLCITO_PACKAGES.reduce((min, pkg) => 
      pkg.priceUSD < min.priceUSD ? pkg : min
    ),
    mostExpensive: SOLCITO_PACKAGES.reduce((max, pkg) => 
      pkg.priceUSD > max.priceUSD ? pkg : max
    ),
    totalSolcitosAvailable: SOLCITO_PACKAGES.reduce((sum, pkg) => 
      sum + pkg.solcitos, 0
    ),
    averagePrice: (
      SOLCITO_PACKAGES.reduce((sum, pkg) => sum + pkg.priceUSD, 0) / 
      SOLCITO_PACKAGES.length
    ).toFixed(2),
    packagesWithBonus: SOLCITO_PACKAGES.filter(pkg => pkg.bonus > 0).length,
  };
}