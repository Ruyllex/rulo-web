// lib/stream-stats.ts
import { db } from "@/lib/db";

/**
 * Inicia una nueva sesión de stream
 */
export async function startStreamSession(streamId: string) {
  return await db.streamSession.create({
    data: {
      streamId,
      startedAt: new Date(),
    },
  });
}

/**
 * Finaliza una sesión de stream y actualiza las estadísticas
 */
export async function endStreamSession(
  sessionId: string,
  stats: {
    peakViewers: number;
    averageViewers: number;
    newFollowers?: number;
    newSubscribers?: number;
    totalDonations?: number;
    totalSolcitos?: number;
  }
) {
  const endedAt = new Date();
  
  const session = await db.streamSession.findUnique({
    where: { id: sessionId },
    include: { stream: true },
  });

  if (!session) return null;

  const durationMinutes = Math.floor(
    (endedAt.getTime() - session.startedAt.getTime()) / (1000 * 60)
  );

  await db.streamSession.update({
    where: { id: sessionId },
    data: {
      endedAt,
      durationMinutes,
      peakViewers: stats.peakViewers,
      averageViewers: stats.averageViewers,
      newFollowers: stats.newFollowers || 0,
      newSubscribers: stats.newSubscribers || 0,
      totalDonations: stats.totalDonations || 0,
      totalSolcitos: stats.totalSolcitos || 0,
    },
  });

  await recalculateStreamStats(session.streamId);

  return session;
}

/**
 * Recalcula las estadísticas totales del stream
 */
export async function recalculateStreamStats(streamId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const allSessions = await db.streamSession.findMany({
    where: { 
      streamId,
      endedAt: { not: null },
    },
  });

  const recentSessions = await db.streamSession.findMany({
    where: {
      streamId,
      startedAt: { gte: thirtyDaysAgo },
      endedAt: { not: null },
    },
  });

  const totalMinutes = allSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalHours = totalMinutes / 60;
  
  const recentMinutes = recentSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const recentHours = recentMinutes / 60;

  const avgViewers = allSessions.length > 0
    ? Math.floor(allSessions.reduce((sum, s) => sum + s.averageViewers, 0) / allSessions.length)
    : 0;
    
  const avgViewersLast30 = recentSessions.length > 0
    ? Math.floor(recentSessions.reduce((sum, s) => sum + s.averageViewers, 0) / recentSessions.length)
    : 0;

  const peakViewers = Math.max(...allSessions.map(s => s.peakViewers), 0);

  const uniqueChattersList = await db.chatActivity.findMany({
    where: {
      streamId,
      lastMessageAt: { gte: thirtyDaysAgo },
    },
    select: { userId: true },
    distinct: ['userId'],
  });

  const uniqueChatters = uniqueChattersList.length;

  await db.stream.update({
    where: { id: streamId },
    data: {
      totalStreamHours: totalHours,
      totalStreamHoursLast30: recentHours,
      averageViewers: avgViewers,
      averageViewersLast30: avgViewersLast30,
      peakViewers: peakViewers,
      uniqueChattersLast30: uniqueChatters,
    },
  });
}

/**
 * Registra actividad de un usuario en el chat
 */
export async function recordChatActivity(
  streamId: string,
  userId: string,
  username: string
) {
  await db.chatActivity.upsert({
    where: {
      streamId_userId: {
        streamId,
        userId,
      },
    },
    update: {
      messageCount: { increment: 1 },
      lastMessageAt: new Date(),
    },
    create: {
      streamId,
      userId,
      username,
      messageCount: 1,
      lastMessageAt: new Date(),
    },
  });
}

/**
 * Limpia registros de chat antiguos (más de 30 días)
 */
export async function cleanupOldChatActivity() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await db.chatActivity.deleteMany({
    where: {
      lastMessageAt: { lt: thirtyDaysAgo },
    },
  });
}