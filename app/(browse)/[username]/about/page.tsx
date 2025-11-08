// app/(browse)/[username]/about/page.tsx
import { notFound } from "next/navigation";
import { getUserByUsername } from "@/lib/user-service";
import { getFollowerCount } from "@/lib/follow-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/verified-badge";
import { 
  Users, 
  Calendar, 
  Eye, 
  Clock, 
  FileText,
  Trophy,
  ArrowLeft,
  TrendingUp,
  Star,
  Heart
} from "lucide-react";
import { PrimeBadge } from "@/components/prime/prime-badge";
import Link from "next/link";

interface AboutPageProps {
  params: {
    username: string;
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { username } = params;

  const user = await getUserByUsername(username);

  if (!user || !user.isStreamer) {
    notFound();
  }

  const followerCount = await getFollowerCount(user.id);
  
  // Valores seguros
  const averageViewers = user.stream?.averageViewers ?? 0;
  const peakViewers = user.stream?.peakViewers ?? 0;
  const totalStreamHours = user.stream?.totalStreamHours ?? 0;
  const createdAt = user.createdAt ?? new Date();
  const isVerified = (user as any).isVerified ?? false;
  const verifiedAt = (user as any).verifiedAt;

  return (
    <div className="min-h-screen bg-background">
      {/* Header compacto */}
      <div className="border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/10 via-background to-cyan-950/10">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/${username}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-cyan-500/10 hover:text-cyan-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al canal
            </Button>
          </Link>
        </div>
      </div>

      {/* Layout principal */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar izquierdo - Info del usuario */}
            <div className="lg:col-span-3 space-y-4">
              {/* Card de usuario */}
              <Card className="border-cyan-500/20 overflow-hidden">
                <div className="p-6 text-center bg-gradient-to-br from-cyan-500/5 to-transparent">
                  <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback className="bg-cyan-600 text-white text-3xl">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent">
                        {user.username}
                      </h2>
                      {isVerified && <VerifiedBadge size="sm" />}
                    </div>

                    {user.isPrime && (
                      <div className="flex justify-center">
                        <PrimeBadge variant="compact" />
                      </div>
                    )}

                    {user.stream?.isLive && (
                      <Badge className="bg-red-500 text-white animate-pulse">
                        🔴 EN VIVO
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="bg-cyan-500/20" />

                {/* Stats rápidos */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-500" />
                      Seguidores
                    </span>
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                      {followerCount.toLocaleString()}
                    </span>
                  </div>

                  {averageViewers > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Eye className="h-4 w-4 text-cyan-500" />
                        Viewers Prom.
                      </span>
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                        {averageViewers}
                      </span>
                    </div>
                  )}

                  {totalStreamHours > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4 text-cyan-500" />
                        Horas Totales
                      </span>
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                        {Number(totalStreamHours).toFixed(1)}h
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Navegación de tabs */}
              <Card className="border-cyan-500/20">
                <div className="p-2">
                  <Link href={`/${username}`}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start hover:bg-cyan-500/10 hover:text-cyan-600"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Inicio
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Acerca de
                  </Button>
                </div>
              </Card>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-9 space-y-6">
              {/* Biografía */}
              <Card className="border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Acerca de
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.bio ? (
                    <p className="text-muted-foreground leading-relaxed">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {user.username} aún no ha agregado nada.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Estadísticas Destacadas */}
              <Card className="border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Estadísticas del Canal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-lg border border-cyan-500/20 text-center">
                      <Users className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                        {followerCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Seguidores</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-lg border border-cyan-500/20 text-center">
                      <Eye className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                        {averageViewers}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Viewers Prom.</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-lg border border-cyan-500/20 text-center">
                      <Trophy className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                        {peakViewers}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Peak Viewers</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-lg border border-cyan-500/20 text-center">
                      <Clock className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                        {Number(totalStreamHours).toFixed(1)}h
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Horas Totales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información del Canal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detalles del canal */}
                <Card className="border-cyan-500/20">
                  <CardHeader>
                    <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Detalles del Canal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isVerified && (
                      <div className="flex items-start gap-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                        <VerifiedBadge size="md" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Canal Verificado</p>
                          {verifiedAt && (
                            <p className="text-xs text-muted-foreground">
                              Desde {new Date(verifiedAt).toLocaleDateString('es-ES', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-cyan-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Fecha de registro</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(createdAt).toLocaleDateString('es-ES', { 
                            day: 'numeric',
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Heart className="h-5 w-5 text-cyan-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Comunidad</p>
                        <p className="text-sm text-muted-foreground">
                          {followerCount} {followerCount === 1 ? 'seguidor' : 'seguidores'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Último Stream */}
                {user.stream?.name && (
                  <Card className="border-cyan-500/20">
                    <CardHeader>
                      <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Actividad Reciente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <FileText className="h-5 w-5 text-cyan-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Último stream</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {user.stream.name}
                          </p>
                        </div>
                      </div>

                      {user.stream.isLive && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                            Transmitiendo ahora
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* CTA Final */}
              <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    ¿Te gusta el contenido de {user.username}?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Síguelo para recibir notificaciones cuando esté en vivo
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Link href={`/${username}`}>
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                      >
                        Ver Canal
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metadata
export async function generateMetadata({ params }: AboutPageProps) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    return {
      title: "Usuario no encontrado",
    };
  }

  return {
    title: `Acerca de ${user.username} | Rulo`,
    description: user.bio || `Conoce más sobre el canal de ${user.username}`,
  };
}