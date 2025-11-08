// lib/user-service.ts
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs";

export const getSelf = async () => {
  const self = await currentUser();

  if (!self || !self.username) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { externalUserId: self.id },
    include: {
      stream: true,
    }
  });

  if (!user) {
    throw new Error("Not found");
  }

  return user;
};

export const getUserByUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      imageUrl: true,
      externalUserId: true,
      bio: true,
      isStreamer: true,
      isPrime: true,
      isVerified: true,        // ✅ AGREGAR
      verifiedAt: true,        // ✅ AGREGAR
      createdAt: true, // ✅ AGREGADO
      solcitosBalance: true,
      stream: {
        select: {
          id: true,
          name: true,
          thumbnailUrl: true,
          isLive: true,
          isChatEnabled: true,
          isChatDelayed: true,
          isChatFollowersOnly: true,
          averageViewers: true,      // ✅ AGREGADO
          peakViewers: true,          // ✅ AGREGADO
          totalStreamHours: true,     // ✅ AGREGADO
        },
      },
      _count: {
        select: {
          followedBy: true,
        },
      },
    },
  });

  return user;
};

export const getUserById = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      username: true,
      imageUrl: true,
      externalUserId: true,
      bio: true,
      isStreamer: true,
      isPrime: true,
      isVerified: true,        // ✅ AGREGAR
      verifiedAt: true,        // ✅ AGREGAR
      showSponsors: true,
      createdAt: true,
      stream: true,
    },
    include: { 
      stream: true,
    },
  });

  return user;
};

// Función adicional para obtener info completa del usuario
export const getUserByUsernameWithFullInfo = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    include: {
      stream: true,
      _count: {
        select: {
          followedBy: true,
          following: true,
        },
      },
    },
  });

  return user;
};