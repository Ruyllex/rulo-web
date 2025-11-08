// lib/auth-service.ts
import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";

export const getSelf = async () => {
  const self = await currentUser();
  
  if (!self) {
    throw new Error("No autenticado");
  }

  let user = await db.user.findUnique({
    where: { externalUserId: self.id },
  });

  if (!user) {
    // Siempre crear con username temporal para forzar configuración
    user = await db.user.create({
      data: {
        externalUserId: self.id,
        username: `user_${self.id}`, // Username temporal
        imageUrl: self.imageUrl || "https://github.com/shadcn.png",
        bio: "",
        isStreamer: false,
      },
    });
  }

  return user;
};

export const getSelfByUsername = async (username: string) => {
  const self = await currentUser();
  
  if (!self) {
    return null;
  }

  let user = await db.user.findUnique({
    where: { externalUserId: self.id },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        externalUserId: self.id,
        username: `user_${self.id}`, // Username temporal
        imageUrl: self.imageUrl || "https://github.com/shadcn.png",
        bio: "",
        isStreamer: false,
      },
    });
  }

  // Verificar que el username coincide
  if (user.username !== username) {
    return null;
  }

  return user;
};

// Nueva función para verificar si necesita configurar username
export const needsUsernameSetup = (username: string) => {
  return username.startsWith("user_");
};