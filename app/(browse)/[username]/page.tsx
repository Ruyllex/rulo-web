// app/(browse)/[username]/page.tsx
import { notFound } from "next/navigation";
import { getUserByUsername } from "@/lib/user-service";
import { isFollowingUser, getFollowerCount } from "@/lib/follow-service";
import { getPlatformSponsors, getStreamerSponsors } from "@/lib/sponsor-service";
import { getSelf } from "@/lib/auth-service";
import { Video } from "@/components/stream-player/video";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FollowButton } from "@/components/user/follow-button";
import { SponsorSection } from "@/components/sponsors/sponsor-section";
import { VerifiedBadge } from "@/components/verified-badge";
import { LiveChat } from "@/components/chat/live-chat";
import { SubscribeButton } from "@/components/chat/chat-actions";
import { Users, Calendar, Eye, TrendingUp, Sparkles, Clock, Star, Gift } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PrimeBadge } from "@/components/prime/prime-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UserPageProps {
  params: {
    username: string;
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = params;

  // Buscar el usuario por username
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  // Verificar si es streamer
  if (!user.isStreamer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 p-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold">{user.username}</h1>
          {user.isVerified && <VerifiedBadge size="lg" />}
        </div>
        <p className="text-muted-foreground text-center max-w-md">
          Este usuario aún no ha activado el modo streamer
        </p>
      </div>
    );
  }

  // Obtener datos adicionales
  let isFollowing = false;
  let isSelf = false;
  let currentUser = null;
  let userBalance = 0;
  
  try {
    const self = await getSelf();
    currentUser = self;
    isFollowing = await isFollowingUser(user.id);
    isSelf = self.id === user.id;
    userBalance = self.solcitosBalance;
  } catch {
    // Usuario no autenticado
  }

  const followerCount = await getFollowerCount(user.id);

  // OBTENER SPONSORS - Respetando la configuración del streamer
  const showSponsors = user.showSponsors ?? true;
  
  const streamerSponsors = showSponsors 
    ? await getStreamerSponsors(user.id) 
    : [];
  const platformSponsors = await getPlatformSponsors();
  
  const allSponsors = showSponsors 
    ? [...streamerSponsors, ...platformSponsors]
    : platformSponsors;

  // Valores seguros para las estadísticas - Convertir Decimal a número
  const averageViewers = user.stream?.averageViewers ?? 0;
  const peakViewers = user.stream?.peakViewers ?? 0;
  const totalStreamHours = user.stream?.totalStreamHours ?? 0;
  const createdAt = user.createdAt ?? new Date();
  const streamId = user.stream?.id;
  
  // Convertir campos Decimal a número para evitar warnings
  const adRevenue = user.adRevenue ? Number(user.adRevenue) : 0;
  const sponsorRevenue = user.sponsorRevenue ? Number(user.sponsorRevenue) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header del canal con gradiente cyan */}
      <div className="border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-background to-cyan-950/20">
        <div className="container mx-auto p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar con borde cyan - Clickeable */}
            <Link href={`/${username}/about`} className="relative flex-shrink-0 group">
              <Avatar className="h-24 w-24 border-4 border-cyan-500/30 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/40 group-hover:scale-105">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback className="bg-cyan-600 text-white text-2xl">
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user.stream?.isLive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
                  <Badge className="bg-red-500 text-white animate-pulse shadow-lg">
                    🔴 EN VIVO
                  </Badge>
                </div>
              )}
            </Link>

            {/* Info del streamer - También clickeable */}
            <div className="flex-1 space-y-2">
              <Link href={`/${username}/about`} className="block group">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent cursor-pointer group-hover:from-cyan-500 group-hover:to-cyan-300 transition-all">
                    {user.username}
                  </h1>
                  {user.isVerified && <VerifiedBadge size="md" />}
                  {user.isPrime && <PrimeBadge variant="compact" />}
                </div>
              </Link>

              {/* Stats - No clickeables */}
              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-500" />
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                    {followerCount.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">seguidores</span>
                </div>
                
                {user.stream && averageViewers > 0 && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-cyan-500" />
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                        {averageViewers}
                      </span>
                      <span className="text-muted-foreground">viewers promedio</span>
                    </div>
                  </>
                )}

                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-500" />
                  <span className="text-muted-foreground">
                    Miembro desde {new Date(createdAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de Follow, Suscribirse y Regalar Sub */}
            {!isSelf && (
              <div className="w-full md:w-auto md:min-w-[350px]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                  <FollowButton
                    userId={user.id}
                    isFollowing={isFollowing}
                    username={user.username}
                    className="w-full"
                  />
                  <SubscribeButton
                    streamerId={user.id}
                    streamerName={user.username}
                    isSubscribed={currentUser?.isPrime}
                    isPrime={currentUser?.isPrime}
                    size="md"
                    className="w-full"
                  />
                  <Button
                    size="default"
                    variant="outline"
                    className="w-full border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-600 dark:text-cyan-400"
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    <span className="whitespace-nowrap">Regalar Sub</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN DE SPONSORS */}
      {allSponsors.length > 0 && (
        <div className="border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 via-transparent to-cyan-500/5">
          <div className="container mx-auto p-4">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-cyan-500" />
              <h3 className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
                {streamerSponsors.length > 0 ? 'Patrocinadores de este canal' : 'Patrocinadores'}
              </h3>
            </div>
            <SponsorSection sponsors={allSponsors} variant="horizontal" />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player y Stream Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <Video
              hostName={user.username}
              hostIdentity={user.id}
            />

            {/* Información del stream */}
            <Card className="border-cyan-500/20">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {/* Información del streamer */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-cyan-500/30 flex-shrink-0">
                      <AvatarImage src={user.imageUrl} />
                      <AvatarFallback className="bg-cyan-600 text-white">
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold mb-1 truncate">
                        {user.stream?.name || `Stream de ${user.username}`}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <span className="font-medium text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                          {user.username}
                          {user.isVerified && <VerifiedBadge size="sm" />}
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{followerCount.toLocaleString()} seguidores</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones - Solo para visitantes */}
                  {!isSelf && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                      <FollowButton
                        userId={user.id}
                        isFollowing={isFollowing}
                        username={user.username}
                        className="w-full"
                      />
                      <SubscribeButton
                        streamerId={user.id}
                        streamerName={user.username}
                        isSubscribed={currentUser?.isPrime}
                        isPrime={currentUser?.isPrime}
                        size="md"
                        className="w-full"
                      />
                      <Button
                        size="default"
                        variant="outline"
                        className="w-full border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-600 dark:text-cyan-400"
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        <span className="whitespace-nowrap">Regalar Sub</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SECCIÓN: Acerca de / Biografía - SIEMPRE VISIBLE */}
            <Card className="border-cyan-500/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Acerca de
                </h3>
                {user.bio ? (
                  <>
                    <p className="text-muted-foreground leading-relaxed">
                      {user.bio}
                    </p>
                    <Link href={`/${username}/about`}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-4 text-cyan-600 hover:text-cyan-500 hover:bg-cyan-500/10"
                      >
                        Ver más información →
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground italic leading-relaxed">
                      {user.username} aún no ha agregado una biografía.
                    </p>
                    <Link href={`/${username}/about`}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-4 text-cyan-600 hover:text-cyan-500 hover:bg-cyan-500/10"
                      >
                        Ver perfil completo →
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Chat y Stats */}
          <div className="lg:col-span-1 space-y-4">
            {/* CHAT EN VIVO FUNCIONAL */}
            {streamId && (
              <Card className="border-cyan-500/20">
                <div className="h-[500px]">
                  <LiveChat
                    streamId={streamId}
                    streamerId={user.id}
                    streamerName={user.username}
                    isFollowing={isFollowing}
                    isPrime={currentUser?.isPrime}
                    isOwner={isSelf}
                    viewerCount={averageViewers}
                    currentUserId={currentUser?.id}
                    userBalance={userBalance}
                  />
                </div>
              </Card>
            )}

            {/* Estadísticas del canal */}
            <Card className="border-cyan-500/20">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Estadísticas del Canal
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-cyan-500/5 rounded-lg">
                    <span className="text-sm text-muted-foreground">Seguidores</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">
                      {followerCount.toLocaleString()}
                    </span>
                  </div>

                  {averageViewers > 0 && (
                    <div className="flex justify-between items-center p-3 bg-cyan-500/5 rounded-lg">
                      <span className="text-sm text-muted-foreground">Viewers Promedio</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        {averageViewers}
                      </span>
                    </div>
                  )}

                  {peakViewers > 0 && (
                    <div className="flex justify-between items-center p-3 bg-cyan-500/5 rounded-lg">
                      <span className="text-sm text-muted-foreground">Viewers Máximos</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        {peakViewers}
                      </span>
                    </div>
                  )}

                  {totalStreamHours > 0 && (
                    <div className="flex justify-between items-center p-3 bg-cyan-500/5 rounded-lg">
                      <span className="text-sm text-muted-foreground">Horas Transmitidas</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        {Number(totalStreamHours).toFixed(1)}h
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-3 bg-cyan-500/5 rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Miembro desde
                    </span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">
                      {new Date(createdAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SPONSORS EN SIDEBAR */}
            {showSponsors && streamerSponsors.length > 0 && (
              <Card className="border-cyan-500/20">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Sponsors Exclusivos
                  </h3>
                  <SponsorSection sponsors={streamerSponsors} variant="sidebar" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generar metadata dinámica
export async function generateMetadata({ params }: UserPageProps) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    return {
      title: "Usuario no encontrado",
    };
  }

  return {
    title: `${user.username} - Stream en vivo | FacuGo! Stream`,
    description: user.bio || `Mira el stream de ${user.username} en FacuGo! Stream`,
  };
}