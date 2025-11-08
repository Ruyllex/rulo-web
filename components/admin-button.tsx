import Link from "next/link";
import { Shield } from "lucide-react";
import { getSelf } from "@/lib/auth-service";

export const AdminButton = async () => {
  let isAdmin = false;

  try {
    const self = await getSelf();
    isAdmin = 
      self.role === "ADMIN" || 
      self.role === "SUPER_ADMIN" || 
      self.role === "MODERATOR";
  } catch (error) {
    // Usuario no autenticado o error
    return null;
  }

  // Si no es admin, no renderizar nada
  if (!isAdmin) {
    return null;
  }

  return (
    <Link
      href="/admin/dashboard"
      className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-full shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110 group"
      title="Panel de Administración"
    >
      <Shield className="w-6 h-6" />
      
      {/* Tooltip */}
      <span className="absolute right-16 bg-gradient-to-r from-cyan-700 to-cyan-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-lg border border-cyan-500/30">
        Panel Admin
      </span>
    </Link>
  );
};