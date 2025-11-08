// app/(dashboard)/u/[username]/stream/page.tsx
import { getSelf } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUserByUsername } from "@/lib/user-service";
import { Eye, Users, Settings, ExternalLink, Video, MessageSquare, Key, AlertCircle } from "lucide-react";
import Link from "next/link";
import { StreamStatus } from "@/components/dashboard/stream-status";

export default async function StreamPage({
  params,
}: {
  params: { username: string };
}) {
  const self = await getSelf();

  if (!self || self.username !== params.username) {
    redirect("/");
  }

  if (!self.isStreamer) {
    redirect(`/u/${params.username}/studio`);
  }

  const stream = await db.stream.findUnique({
    where: { userId: self.id },
  });

  if (!stream) {
    redirect(`/u/${params.username}/studio`);
  }

  // Obtener el usuario completo para mostrar info
  const user = await getUserByUsername(params.username);
  
  if (!user) {
    redirect("/");
  }

  // Verificar si tiene credenciales configuradas
  const hasCredentials = self.serverUrl && self.streamKey;

  async function updateStreamInfo(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    
    await db.stream.update({
      where: { userId: self.id },
      data: {
        name: name,
      },
    });
    
    redirect(`/u/${params.username}/stream`);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent">
            Dashboard de Stream
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu transmisión en vivo
          </p>
        </div>
        
        <Link href={`/${params.username}`} target="_blank">
          <Button variant="outline" className="hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-600 transition-all">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Canal Público
          </Button>
        </Link>
      </div>

      {/* Alerta si no tiene credenciales */}
      {!hasCredentials && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Configura tus credenciales de streaming
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                Ve a la pestaña <Link href={`/u/${params.username}/keys`} className="underline font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100">Stream Keys</Link> para obtener tus credenciales de OBS.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Grid con Status y Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Estado del Stream en tiempo real */}
        <StreamStatus
          hostIdentity={self.id}
          username={self.username}
        />

        {/* Quick Actions */}
        <Card className="border-cyan-500/20">
          <div className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
              <Settings className="h-4 w-4" />
              Acciones Rápidas
            </h3>
            <div className="space-y-2">
              <Link href={`/u/${params.username}/keys`} className="block">
                <Button variant="outline" size="sm" className="w-full justify-start hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-600 transition-all group">
                  <Key className="h-4 w-4 mr-2 text-cyan-500 group-hover:scale-110 transition-transform" />
                  Ver Stream Keys
                </Button>
              </Link>
              <Link href={`/u/${params.username}/chat`} className="block">
                <Button variant="outline" size="sm" className="w-full justify-start hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-600 transition-all group">
                  <MessageSquare className="h-4 w-4 mr-2 text-cyan-500 group-hover:scale-110 transition-transform" />
                  Configurar Chat
                </Button>
              </Link>
              <Link href={`/u/${params.username}/community`} className="block">
                <Button variant="outline" size="sm" className="w-full justify-start hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-600 transition-all group">
                  <Users className="h-4 w-4 mr-2 text-cyan-500 group-hover:scale-110 transition-transform" />
                  Comunidad
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Configuración del Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 border-cyan-500/20">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-cyan-500">⚙️</span>
              Configuración del Stream
            </h2>
            
            <form action={updateStreamInfo} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Título del Stream</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={stream.name}
                  className="mt-1 w-full px-3 py-2 border border-cyan-500/30 rounded-md bg-background focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                  placeholder="¿De qué vas a streamear hoy?"
                />
              </div>
              <Button type="submit" size="sm" className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/30">
                Actualizar Título
              </Button>
            </form>
          </Card>

          <Card className="p-6 border-cyan-500/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
              <Video className="h-4 w-4" />
              ¿Cómo empezar a transmitir?
            </h3>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-700 text-white text-sm font-bold shrink-0">
                  1
                </span>
                <div>
                  <p className="font-medium">Obtén tus credenciales</p>
                  <p className="text-sm text-muted-foreground">
                    Ve a <Link href={`/u/${params.username}/keys`} className="underline text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">Stream Keys</Link> y copia tu Server URL y Stream Key
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-700 text-white text-sm font-bold shrink-0">
                  2
                </span>
                <div>
                  <p className="font-medium">Configura OBS Studio</p>
                  <p className="text-sm text-muted-foreground">
                    Configuración → Stream → Personalizado. Pega las credenciales.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-700 text-white text-sm font-bold shrink-0">
                  3
                </span>
                <div>
                  <p className="font-medium">Comienza a transmitir</p>
                  <p className="text-sm text-muted-foreground">
                    Presiona &quot;Iniciar transmisión&quot; en OBS. Tu stream aparecerá automáticamente.
                  </p>
                </div>
              </li>
            </ol>

            <div className="bg-cyan-500/10 border border-cyan-500/50 rounded-lg p-4 mt-4">
              <p className="text-sm text-cyan-700 dark:text-cyan-300">
                💡 <strong>Tip:</strong> No necesitas presionar ningún botón aquí. 
                El stream se inicia automáticamente cuando OBS se conecta.
              </p>
            </div>
          </Card>
        </div>

        {/* Sidebar con estadísticas */}
        <div className="space-y-4">
          <Card className="p-6 border-cyan-500/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
              <Eye className="h-4 w-4" />
              Estadísticas Totales
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between p-2 rounded-lg bg-gradient-to-br from-cyan-500/5 to-transparent hover:from-cyan-500/10 transition-all">
                <span className="text-sm text-muted-foreground">Horas Totales</span>
                <span className="font-medium text-cyan-600 dark:text-cyan-400">{Number(stream.totalStreamHours).toFixed(1)}h</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gradient-to-br from-cyan-500/5 to-transparent hover:from-cyan-500/10 transition-all">
                <span className="text-sm text-muted-foreground">Promedio Viewers</span>
                <span className="font-medium text-cyan-600 dark:text-cyan-400">{stream.averageViewers}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gradient-to-br from-cyan-500/5 to-transparent hover:from-cyan-500/10 transition-all">
                <span className="text-sm text-muted-foreground">Peak Viewers</span>
                <span className="font-medium text-cyan-600 dark:text-cyan-400">{stream.peakViewers}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
              <Video className="h-4 w-4" />
              Canal Público
            </h3>
            <p className="text-sm text-cyan-800 dark:text-cyan-200 mb-3">
              Comparte este enlace con tus viewers:
            </p>
            <code className="text-xs bg-white dark:bg-black p-2 rounded block break-all border border-cyan-500/30">
              {typeof window !== 'undefined' ? window.location.origin : ''}/{params.username}
            </code>
            <Link href={`/${params.username}`} target="_blank" className="mt-3 block">
              <Button variant="outline" size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-600 hover:border-cyan-700 shadow-lg shadow-cyan-500/30">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir en nueva pestaña
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}