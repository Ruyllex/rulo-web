// app/(dashboard)/u/[username]/studio/page.tsx
import { redirect } from "next/navigation";
import { getSelf, needsUsernameSetup } from "@/lib/auth-service";
import { getFollowerCount } from "@/lib/follow-service";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Circle, Key, MessageSquare, Eye, Users, DollarSign, Coins } from "lucide-react";
import { BecomeStreamerButton } from "@/components/become-streamer-button";

export default async function StudioPage({ 
  params 
}: { 
  params: { username: string } 
}) {
  const currentUser = await getSelf().catch(() => null);

  if (!currentUser) {
    redirect("/");
  }

  if (needsUsernameSetup(currentUser.username)) {
    redirect("/setup-username");
  }
  
  if (!currentUser.isStreamer) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent">
              Convertirte en Streamer
            </h1>
            <p className="text-muted-foreground">
              Activa el modo streamer para comenzar a transmitir
            </p>
          </div>

          <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-cyan-500">✨</span>
              ¿Qué obtienes?
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-cyan-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Credenciales de streaming únicas</p>
                  <p className="text-sm text-muted-foreground">
                    Server URL y Stream Key para OBS
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Canal público propio</p>
                  <p className="text-sm text-muted-foreground">
                    En /{currentUser.username}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Dashboard completo</p>
                  <p className="text-sm text-muted-foreground">
                    Estadísticas, configuración y herramientas
                  </p>
                </div>
              </li>
            </ul>
          </Card>

          <BecomeStreamerButton username={currentUser.username} />
        </div>
      </div>
    );
  }

  // Obtener el conteo real de followers
  const followerCount = await getFollowerCount(currentUser.id);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent">
        Studio de {currentUser.username}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/u/${currentUser.username}/stream`}>
          <Card className="p-6 hover:bg-cyan-500/10 hover:border-cyan-500/50 cursor-pointer transition-all duration-300 group">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Circle className="h-4 w-4 fill-red-500 text-red-500 group-hover:animate-pulse" />
              Mi Stream
            </h3>
            <p className="text-sm text-muted-foreground">
              Gestiona tu transmisión en vivo
            </p>
          </Card>
        </Link>

        <Link href={`/u/${currentUser.username}/keys`}>
          <Card className="p-6 hover:bg-cyan-500/10 hover:border-cyan-500/50 cursor-pointer transition-all duration-300 group">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Key className="h-4 w-4 text-cyan-500 group-hover:scale-110 transition-transform" />
              Stream Keys
            </h3>
            <p className="text-sm text-muted-foreground">
              Configuración para OBS
            </p>
          </Card>
        </Link>

        <Link href={`/u/${currentUser.username}/chat`}>
          <Card className="p-6 hover:bg-cyan-500/10 hover:border-cyan-500/50 cursor-pointer transition-all duration-300 group">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-500 group-hover:scale-110 transition-transform" />
              Chat Settings
            </h3>
            <p className="text-sm text-muted-foreground">
              Configura tu chat
            </p>
          </Card>
        </Link>
      </div>

      <Card className="p-6 border-cyan-500/20">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-cyan-500">📊</span>
          Quick Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-cyan-500/5 to-transparent hover:from-cyan-500/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-cyan-500" />
              <p className="text-2xl font-bold">0</p>
            </div>
            <p className="text-sm text-muted-foreground">Viewers</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-cyan-500/5 to-transparent hover:from-cyan-500/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-cyan-500" />
              <p className="text-2xl font-bold">{followerCount}</p>
            </div>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-cyan-500/5 to-transparent hover:from-cyan-500/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-5 w-5 text-cyan-500" />
              <p className="text-2xl font-bold">{currentUser.solcitosBalance || 0}</p>
            </div>
            <p className="text-sm text-muted-foreground">Solcitos</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-cyan-500/5 to-transparent hover:from-cyan-500/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-cyan-500" />
              <p className="text-2xl font-bold">$0</p>
            </div>
            <p className="text-sm text-muted-foreground">Ganancias</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-700">
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
          🎥 ¿Cómo empezar a transmitir?
        </h3>
        <ol className="space-y-2 text-sm text-cyan-900 dark:text-cyan-100">
          <li>1. Ve a <Link href={`/u/${currentUser.username}/keys`} className="underline font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">Stream Keys</Link> y copia tus credenciales</li>
          <li>2. Configúralas en OBS Studio</li>
          <li>3. Presiona &quot;Iniciar transmisión&quot; en OBS</li>
          <li>4. Tu stream aparecerá automáticamente en <Link href={`/${currentUser.username}`} className="underline font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">/{currentUser.username}</Link></li>
        </ol>
      </Card>
    </div>
  );
}