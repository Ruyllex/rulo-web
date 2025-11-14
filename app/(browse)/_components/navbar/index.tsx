import React from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { Actions } from "./actions";
import { Button } from "@/components/ui/button";
import { Crown, Sun } from "lucide-react";
import { Search } from "./search";
import { PrimeBadge } from "@/components/prime/prime-badge";
import { getSelf } from "@/lib/auth-service";
import { UserMenu } from "@/components/navbar/user-menu";

export async function Navbar() {
  let user = null;
  
  try {
    user = await getSelf();
  } catch {
    // Usuario no autenticado
  }
  
  return (
    <div className="fixed top-0 w-full h-20 z-[49] bg-[#252731] px-4 lg:px-6 flex justify-between items-center shadow-sm border-b border-cyan-500/20 gap-4">
      {/* Logo - flex-shrink-0 evita que se comprima */}
      <div className="flex-shrink-0 w-16 lg:w-20">
        <Logo />
      </div>

      {/* Search - ocupa el espacio central disponible */}
      <div className="flex-1 max-w-4xl mx-auto">
        <Search />
      </div>

      {/* Actions - flex-shrink-0 evita que se comprima */}
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        {/* Botón de Solcitos - Solo visible si está logueado */}
        {user && (
          <Link href="/showcase" passHref>
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/20 transition-all px-3 h-10"
            >
              <Sun className="h-4 w-4" />
              <span className="hidden md:inline font-semibold">Solcitos</span>
            </Button>
          </Link>
        )}

        {/* Prime Button o Badge */}
        {user && (
          user.isPrime ? (
            // Si ya es Prime, mostrar badge con detalles cyan
            <Link href="/prime" passHref>
              <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-cyan-500/10 hover:from-yellow-500/20 hover:to-cyan-500/20 border border-cyan-500/30 transition-all px-3 h-10"
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
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/20 transition-all px-3 h-10"
              >
                <Crown className="h-4 w-4" />
              </Button>
            </Link>
          )
        )}

        {/* Mostrar UserMenu si no está autenticado, o Actions si lo está */}
        <div className="flex-shrink-0">
          {user ? <Actions /> : <UserMenu />}
        </div>
      </div>
    </div>
  );
}