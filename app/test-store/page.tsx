'use client';

export default function TestStore() {
  return (
    <div className="min-h-screen bg-[#0e0e10] pt-20 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Simple - Tienda de Solcitos</h1>
        
        {/* Test básico sin componente */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#18181b] border border-[#2d2d35] rounded-lg p-4">
              <div className="text-white">Paquete {i}</div>
              <div className="text-yellow-500 text-2xl font-bold">95 Solcitos</div>
              <div className="text-green-500">$1.99</div>
            </div>
          ))}
        </div>

        <div className="border-2 border-yellow-500 p-4 rounded">
          <p className="text-white mb-4">Si ves estas cards arriba, el problema es con el componente SolcitoStore</p>
          <p className="text-white">Ahora probemos el componente real:</p>
        </div>

        {/* Importar manualmente el componente aquí para test */}
        <div className="mt-8 space-y-6">
          {/* Balance */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">Tu Balance</div>
              <span className="text-2xl font-bold text-yellow-500">1,250 ☀</span>
            </div>
          </div>

          {/* Paquetes */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { id: 'pack-95', amount: 95, price: 1.99, bonus: 0 },
              { id: 'pack-245', amount: 245, price: 2.99, bonus: 0 },
              { id: 'pack-510', amount: 510, price: 4.99, bonus: 0 },
              { id: 'pack-1050', amount: 1050, price: 8.99, bonus: 0, popular: true },
              { id: 'pack-2750', amount: 2750, price: 10.99, bonus: 100 },
              { id: 'pack-5550', amount: 5550, price: 15.99, bonus: 250 },
            ].map((pkg) => (
              <div
                key={pkg.id}
                className={`relative cursor-pointer transition-all hover:scale-105 bg-[#18181b] border rounded-lg p-4 ${
                  pkg.popular ? 'border-yellow-500' : 'border-[#2d2d35]'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                    Más Popular
                  </span>
                )}
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-500 font-bold text-lg">
                    {pkg.amount.toLocaleString()} ☀
                  </span>
                  <span className="text-xl font-bold text-green-500">
                    ${pkg.price}
                  </span>
                </div>
                
                {pkg.bonus > 0 && (
                  <div className="text-purple-500 text-xs">
                    +{pkg.bonus} de bonus!
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-2">
                  ${(pkg.price / pkg.amount * 100).toFixed(2)} por 100 ☀
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}