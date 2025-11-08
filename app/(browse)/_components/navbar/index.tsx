// components/navbar/index.tsx
import React from "react";
import Link from "next/link";

import { Logo } from "./logo";
import { Actions } from "./actions";
import { Button } from "@/components/ui/button";
import { Sun, Crown } from "lucide-react";
import { Search } from "./search";
import { PrimeBadge } from "@/components/prime/prime-badge";
import { getSelf } from "@/lib/auth-service";

export async function Navbar() {
  let user = null;
  
  try {
    user = await getSelf();
  } catch {
    // Usuario no autenticado
  }
  
  return (
    <div className="fixed top-0 w-full h-20 z-[49] bg-[#252731] px-2 lg:px-4 flex justify-between items-center shadow-sm border-b border-cyan-500/20">
      <Logo />
      <Search />
      <div className="flex items-center gap-3">
        {/* Botón de Solcitos - Azul Celeste */}
        <Link href="/showcase" passHref>
          <Button
            variant="secondary"
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/20 transition-all"
          >
            {/* <Sun className="h-4 w-4 text-cyan-100" /> */}
            <span className="hidden sm:inline font-semibold">Comprar Solcitos</span>
            <span className="sm:hidden font-semibold">Solcitos</span>
          </Button>
        </Link>

        {/* Prime Button o Badge */}
        {user && (
          user.isPrime ? (
            // Si ya es Prime, mostrar badge con detalles cyan
            <Link href="/prime" passHref>
              <Button
                variant="ghost"
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-cyan-500/10 hover:from-yellow-500/20 hover:to-cyan-500/20 border border-cyan-500/30 transition-all"
              >
                <PrimeBadge variant="compact" showTooltip={false} />
                <span className="hidden lg:inline bg-gradient-to-r from-yellow-500 to-cyan-400 bg-clip-text text-transparent font-semibold">
                  Prime
                </span>
              </Button>
            </Link>
          ) : (
            // Si no es Prime, mostrar botón para suscribirse con acento cyan
            <Link href="/prime" passHref>
              <Button
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Obtener Prime</span>
                <span className="sm:hidden">Prime</span>
              </Button>
            </Link>
          )
        )}

        <Actions />
      </div>
    </div>
  );
}