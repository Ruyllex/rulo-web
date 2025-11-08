// app/(dashboard)/u/[username]/canal/perfil/page.tsx
import { getSelf } from "@/lib/auth-service";
import { getFollowerCount } from "@/lib/follow-service"; // ✅ AGREGADO
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, FileText, Shield, Star, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default async function CanalPerfilPage({
  params,
}: {
  params: { username: string };
}) {
  const self = await getSelf();

  if (!self || self.username !== params.username) {
    redirect("/");
  }

  // ✅ OBTENER FOLLOWERS REALES
  const followerCount = await getFollowerCount(self.id);

  async function updateUsername(formData: FormData) {
    "use server";
    
    const newUsername = formData.get("username") as string;
    
    if (!newUsername || newUsername.length < 3) {
      throw new Error("Username debe tener al menos 3 caracteres");
    }

    const existing = await db.user.findUnique({
      where: { username: newUsername },
    });

    if (existing && existing.id !== self.id) {
      throw new Error("Este username ya está en uso");
    }

    await db.user.update({
      where: { id: self.id },
      data: { username: newUsername },
    });

    redirect(`/u/${newUsername}/canal/perfil`);
  }

  async function updateBio(formData: FormData) {
    "use server";
    
    const bio = formData.get("bio") as string;
    
    await db.user.update({
      where: { id: self.id },
      data: { bio: bio || null },
    });

    redirect(`/u/${params.username}/canal/perfil`);
  }

  // ✅ ACCIÓN: Toggle Sponsors
  async function toggleSponsors(formData: FormData) {
    "use server";
    
    const currentValue = formData.get("currentValue") === "true";
    const newValue = !currentValue;
    
    await db.user.update({
      where: { id: self.id },
      data: { showSponsors: newValue },
    });

    redirect(`/u/${params.username}/canal/perfil`);
  }

  // Obtener número de sponsors activos del streamer
  const sponsorCount = await db.sponsor.count({
    where: {
      streamerId: self.id,
      status: "ACTIVE",
      endDate: { gte: new Date() },
    },
  });

  // ✅ OBTENER VALOR REAL DE showSponsors
  const userWithSponsors = await db.user.findUnique({
    where: { id: self.id },
    select: { showSponsors: true },
  });
  
  const showSponsors = userWithSponsors?.showSponsors ?? true;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent">
          Perfil
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestiona la información de tu canal
        </p>
      </div>

      {/* Vista previa del perfil */}
      <Card className="p-6 border-cyan-500/20">
        <h2 className="text-xl font-semibold mb-4 text-cyan-600 dark:text-cyan-400">
          Vista previa del perfil
        </h2>
        
        <div className="flex items-start gap-4">
          <Avatar className="h-24 w-24 border-4 border-cyan-500/30">
            <AvatarImage src={self.imageUrl} />
            <AvatarFallback className="bg-cyan-600 text-white">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Sobre {self.username}</h3>
            {/* ✅ FOLLOWERS REALES */}
            <p className="text-sm text-muted-foreground mb-2">
              {followerCount.toLocaleString()} {followerCount === 1 ? 'Seguidor' : 'Seguidores'}
            </p>
            <p className="text-sm">
              {self.bio || `Canal de ${self.username}`}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-600 transition-all"
          >
            Editar Avatar
          </Button>
        </div>
      </Card>

      {/* ✅ SECCIÓN: Control de Sponsors */}
      {self.isStreamer && (
        <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Star className="h-6 w-6 text-cyan-500" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-cyan-600 dark:text-cyan-400">
                Patrocinadores
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Controla la visibilidad de los patrocinadores en tu canal
              </p>

              {/* Stats de sponsors */}
              <div className="mb-4 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Sponsors activos:
                  </span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    {sponsorCount}
                  </span>
                </div>
              </div>

              {/* Toggle Form - CORREGIDO */}
              <form action={toggleSponsors} className="space-y-4">
                <input 
                  type="hidden" 
                  name="currentValue" 
                  value={showSponsors.toString()} 
                />
                
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-cyan-500/20">
                  <div className="flex items-center gap-3">
                    {showSponsors ? (
                      <Eye className="h-5 w-5 text-cyan-500" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <Label className="text-base font-medium">
                        {showSponsors ? 'Sponsors visibles' : 'Sponsors ocultos'}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {showSponsors 
                          ? 'Los patrocinadores se muestran en tu canal'
                          : 'Los patrocinadores están ocultos en tu canal'
                        }
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    variant={showSponsors ? 'default' : 'outline'}
                    className={
                      showSponsors
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'hover:bg-cyan-500/10 hover:border-cyan-500/50'
                    }
                  >
                    {showSponsors ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
              </form>

              {/* Info adicional */}
              {sponsorCount === 0 && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    ℹ️ No tienes patrocinadores activos. Los patrocinadores aparecerán aquí cuando 
                    tengas contratos activos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Detalles básicos */}
      <Card className="p-6 border-cyan-500/20">
        <h2 className="text-xl font-semibold mb-6 text-cyan-600 dark:text-cyan-400">
          Detalles básicos
        </h2>
        
        <div className="space-y-6">
          {/* Nombre de usuario */}
          <div>
            <Label htmlFor="username" className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-cyan-500" />
              Nombre de usuario
            </Label>
            <form action={updateUsername} className="space-y-3">
              <Input
                id="username"
                name="username"
                defaultValue={self.username}
                placeholder="ej: RuloGamer"
                required
                minLength={3}
                maxLength={20}
                pattern="^[a-zA-Z0-9_]+$"
                className="border-cyan-500/30 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Shield className="h-3 w-3" />
                Necesitas habilitar 2FA para actualizar tu nombre de usuario.{" "}
                <Link href="#" className="underline text-cyan-600 dark:text-cyan-400 hover:text-cyan-700">
                  Click aquí para configurar 2FA
                </Link>
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                >
                  Guardar cambios
                </Button>
              </div>
            </form>
          </div>

          <div className="border-t border-cyan-500/10 pt-6">
            {/* Correo Electrónico */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-cyan-500" />
                Correo Electrónico
              </Label>
              <div className="space-y-3">
                <Input
                  id="email"
                  type="email"
                  defaultValue={self.externalUserId}
                  disabled
                  className="bg-muted border-cyan-500/20"
                />
                <p className="text-xs text-muted-foreground">
                  El correo electrónico está vinculado a tu cuenta de Clerk y no se puede cambiar aquí.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-cyan-500/10 pt-6">
            {/* Biografía */}
            <div>
              <Label htmlFor="bio" className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-cyan-500" />
                Biografía
              </Label>
              <form action={updateBio} className="space-y-3">
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={self.bio || ""}
                  placeholder="Cuéntale a tu comunidad sobre ti..."
                  rows={4}
                  maxLength={300}
                  className="resize-none border-cyan-500/30 focus:ring-cyan-500/50 focus:border-cyan-500"
                />
                <p className="text-xs text-muted-foreground">
                  {self.bio?.length || 0}/300 caracteres
                </p>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm">
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    size="sm"
                    className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                  >
                    Guardar cambios
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Card>

      {/* Información adicional */}
      <Card className="p-6 bg-cyan-500/5 border-cyan-500/20">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-cyan-500 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Seguridad de tu cuenta</h3>
            <p className="text-sm text-muted-foreground">
              Para mayor seguridad, te recomendamos habilitar la autenticación de dos factores (2FA) 
              en tu cuenta. Esto protegerá tu perfil y te permitirá acceder a funciones avanzadas.
            </p>
            <Button 
              variant="link" 
              className="px-0 mt-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700"
            >
              Configurar 2FA ahora
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}