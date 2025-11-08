import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

// Obtener configuración del chat
export async function getChatSettings(streamId: string) {
  const settings = await db.chatSettings.findUnique({
    where: { streamId },
  });

  if (!settings) {
    // Crear configuración por defecto si no existe
    return await db.chatSettings.create({
      data: {
        streamId,
        isChatEnabled: true,
      },
    });
  }

  return settings;
}

// Actualizar configuración del chat (solo el streamer)
export async function updateChatSettings(
  streamId: string,
  data: {
    isChatEnabled?: boolean;
    isChatDelayed?: boolean;
    chatDelaySeconds?: number;
    isChatFollowersOnly?: boolean;
    isChatSubscribersOnly?: boolean;
    slowModeSeconds?: number;
  }
) {
  const self = await getSelf();

  // Verificar que el usuario sea el dueño del stream
  const stream = await db.stream.findUnique({
    where: { id: streamId },
    include: { user: true },
  });

  if (!stream || stream.userId !== self.id) {
    throw new Error("No autorizado");
  }

  return await db.chatSettings.upsert({
    where: { streamId },
    update: data,
    create: {
      streamId,
      ...data,
    },
  });
}

// Obtener mensajes del chat
export async function getChatMessages(streamId: string, limit = 100) {
  const messages = await db.chatMessage.findMany({
    where: {
      streamId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return messages.reverse(); // Ordenar del más antiguo al más nuevo
}

// Enviar mensaje al chat
export async function sendChatMessage(
  streamId: string,
  message: string,
  solcitos?: number
) {
  const self = await getSelf();

  // Verificar configuración del chat
  const settings = await getChatSettings(streamId);

  if (!settings.isChatEnabled) {
    throw new Error("El chat está deshabilitado");
  }

  // Verificar followers only
  if (settings.isChatFollowersOnly) {
    const stream = await db.stream.findUnique({
      where: { id: streamId },
    });

    if (stream) {
      const isFollowing = await db.follow.findFirst({
        where: {
          followerId: self.id,
          followingId: stream.userId,
        },
      });

      if (!isFollowing && stream.userId !== self.id) {
        throw new Error("Debes seguir al canal para chatear");
      }
    }
  }

  // Verificar subscribers only
  if (settings.isChatSubscribersOnly && !self.isPrime) {
    const stream = await db.stream.findUnique({
      where: { id: streamId },
    });

    if (stream && stream.userId !== self.id) {
      throw new Error("Solo los suscriptores pueden chatear");
    }
  }

  // Filtrar palabras bloqueadas
  const blockedWords = settings.blockedWords || [];
  const lowerMessage = message.toLowerCase();
  const hasBlockedWord = blockedWords.some((word) =>
    lowerMessage.includes(word.toLowerCase())
  );

  if (hasBlockedWord) {
    throw new Error("Tu mensaje contiene palabras no permitidas");
  }

  // Verificar si el usuario es el streamer o moderador
  const stream = await db.stream.findUnique({
    where: { id: streamId },
    include: { user: true },
  });

  const isStreamer = stream?.userId === self.id;
  const isModerator = self.role === "MODERATOR" || self.role === "ADMIN";

  // Crear el mensaje
  const chatMessage = await db.chatMessage.create({
    data: {
      message,
      userId: self.id,
      username: self.username,
      userImage: self.imageUrl,
      streamId,
      isPrime: self.isPrime,
      isStreamer,
      isModerator,
      solcitos,
    },
  });

  return chatMessage;
}

// Eliminar mensaje (moderadores/streamers)
export async function deleteChatMessage(messageId: string) {
  const self = await getSelf();

  const message = await db.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      stream: true,
    },
  });

  if (!message) {
    throw new Error("Mensaje no encontrado");
  }

  // Verificar permisos
  const isStreamer = message.stream.userId === self.id;
  const isModerator =
    self.role === "MODERATOR" ||
    self.role === "ADMIN" ||
    self.role === "SUPER_ADMIN";

  if (!isStreamer && !isModerator && message.userId !== self.id) {
    throw new Error("No autorizado");
  }

  return await db.chatMessage.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      deletedBy: self.id,
      deletedAt: new Date(),
    },
  });
}

// Limpiar chat (solo streamer)
export async function clearChat(streamId: string) {
  const self = await getSelf();

  const stream = await db.stream.findUnique({
    where: { id: streamId },
  });

  if (!stream || stream.userId !== self.id) {
    throw new Error("No autorizado");
  }

  return await db.chatMessage.updateMany({
    where: {
      streamId,
      isDeleted: false,
    },
    data: {
      isDeleted: true,
      deletedBy: self.id,
      deletedAt: new Date(),
    },
  });
}

// Banear palabra
export async function addBlockedWord(streamId: string, word: string) {
  const self = await getSelf();

  const stream = await db.stream.findUnique({
    where: { id: streamId },
  });

  if (!stream || stream.userId !== self.id) {
    throw new Error("No autorizado");
  }

  const settings = await getChatSettings(streamId);
  const blockedWords = settings.blockedWords || [];

  if (!blockedWords.includes(word.toLowerCase())) {
    blockedWords.push(word.toLowerCase());
  }

  return await db.chatSettings.update({
    where: { streamId },
    data: { blockedWords },
  });
}

// Remover palabra baneada
export async function removeBlockedWord(streamId: string, word: string) {
  const self = await getSelf();

  const stream = await db.stream.findUnique({
    where: { id: streamId },
  });

  if (!stream || stream.userId !== self.id) {
    throw new Error("No autorizado");
  }

  const settings = await getChatSettings(streamId);
  const blockedWords = (settings.blockedWords || []).filter(
    (w) => w.toLowerCase() !== word.toLowerCase()
  );

  return await db.chatSettings.update({
    where: { streamId },
    data: { blockedWords },
  });
}