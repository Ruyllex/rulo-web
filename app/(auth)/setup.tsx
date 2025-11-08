// app/(auth)/setup/page.tsx
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default async function SetupPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Verificar si ya tiene usuario en la DB
  const dbUser = await db.user.findUnique({
    where: { externalUserId: user.id },
  });

  if (dbUser && dbUser.username) {
    redirect("/");
  }

  async function setupUsername(formData: FormData) {
    "use server";
    
    const username = formData.get("username") as string;
    
    if (!username || username.length < 3) {
      throw new Error("Username debe tener al menos 3 caracteres");
    }

    // Verificar que el username no esté tomado
    const existing = await db.user.findUnique({
      where: { username },
    });

    if (existing) {
      throw new Error("Este username ya está en uso");
    }

    // Crear o actualizar usuario
    const dbUser = await db.user.upsert({
      where: { externalUserId: user.id },
      update: {
        username,
        imageUrl: user.imageUrl || "https://github.com/shadcn.png",
      },
      create: {
        externalUserId: user.id,
        username,
        imageUrl: user.imageUrl || "https://github.com/shadcn.png",
      },
    });

    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido! 👋</h1>
          <p className="text-muted-foreground">
            Elige tu nombre de usuario para continuar
          </p>
        </div>

        <form action={setupUsername} className="space-y-4">
          <div>
            <label htmlFor="username" className="text-sm font-medium">
              Nombre de usuario
            </label>
            <Input
              id="username"
              name="username"
              placeholder="ej: StreamerPro123"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Solo letras, números y guiones bajos. 3-20 caracteres.
            </p>
          </div>
          
          <Button type="submit" className="w-full" size="lg">
            Continuar
          </Button>
        </form>
      </Card>
    </div>
  );
}