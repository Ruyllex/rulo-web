// lib/achievements-service.ts
import { db } from "@/lib/db";

export interface AchievementStats {
  totalStreamHours: number;
  streamHoursLast30Days: number;
  totalActiveSubscribers: number;
  subscribersLast30Days: number;
  averageViewers: number;
  averageViewersLast30Days: number;
  uniqueChattersTotal: number;
  uniqueChattersLast30Days: number;
  totalFollowers: number;
}

export async function getAchievementStats(userId: string): Promise<AchievementStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const stream = await db.stream.findUnique({
    where: { userId },
    select: {
      id: true,
      totalStreamHours: true,
      totalStreamHoursLast30: true,
      averageViewers: true,
      averageViewersLast30: true,
      uniqueChattersLast30: true,
    },
  });

  const totalActiveSubscribers = await db.channelSubscription.count({
    where: {
      streamerId: userId,
      status: "active",
    },
  });

  const subscribersLast30Days = await db.channelSubscription.count({
    where: {
      streamerId: userId,
      status: "active",
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  const totalFollowers = await db.follow.count({
    where: { followingId: userId },
  });

  // Corregir el count con distinct - usar groupBy o findMany
  const uniqueChattersList = await db.chatActivity.findMany({
    where: { streamId: stream?.id || "" },
    select: { userId: true },
    distinct: ['userId'],
  });
  
  const uniqueChattersTotal = uniqueChattersList.length;

  return {
    totalStreamHours: stream?.totalStreamHours ? Number(stream.totalStreamHours) : 0,
    streamHoursLast30Days: stream?.totalStreamHoursLast30 ? Number(stream.totalStreamHoursLast30) : 0,
    totalActiveSubscribers,
    subscribersLast30Days,
    averageViewers: stream?.averageViewers || 0,
    averageViewersLast30Days: stream?.averageViewersLast30 || 0,
    uniqueChattersTotal,
    uniqueChattersLast30Days: stream?.uniqueChattersLast30 || 0,
    totalFollowers,
  };
}