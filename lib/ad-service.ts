import { db } from "@/lib/db";
import { AdType, AdStatus } from "@prisma/client";

export const getActiveAds = async (type: AdType, isPrime: boolean = false) => {
  const now = new Date();
  
  return await db.ad.findMany({
    where: {
      type,
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
      ...(isPrime ? { targetPrime: true } : {}),
    },
    orderBy: {
      impressions: 'asc',
    },
    take: 1,
  });
};

export const getAdForStream = async (
  type: AdType, 
  viewerCount: number,
  isPrime: boolean = false
) => {
  const now = new Date();
  
  const ad = await db.ad.findFirst({
    where: {
      type,
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
      minViewers: { lte: viewerCount },
      maxViewers: { gte: viewerCount },
      targetPrime: isPrime ? true : undefined,
    },
    orderBy: [
      { impressions: 'asc' },
      { cpm: 'desc' },
    ],
  });

  return ad;
};

export const recordAdImpression = async (
  adId: string,
  userId: string | null,
  streamId: string | null,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    country?: string;
  }
) => {
  const impression = await db.adImpression.create({
    data: {
      adId,
      userId,
      streamId,
      shown: true,
      ...metadata,
    },
  });

  await db.ad.update({
    where: { id: adId },
    data: {
      impressions: { increment: 1 },
    },
  });

  return impression;
};

export const recordAdClick = async (impressionId: string, adId: string) => {
  await db.$transaction([
    db.adImpression.update({
      where: { id: impressionId },
      data: { clicked: true },
    }),
    db.ad.update({
      where: { id: adId },
      data: {
        clicks: { increment: 1 },
      },
    }),
  ]);
};

export const recordAdCompletion = async (impressionId: string, adId: string) => {
  await db.$transaction([
    db.adImpression.update({
      where: { id: impressionId },
      data: { completed: true },
    }),
    db.ad.update({
      where: { id: adId },
      data: { completions: { increment: 1 } },
    }),
  ]);
};

export const recordAdSkip = async (impressionId: string, adId: string, watchTime: number) => {
  await db.$transaction([
    db.adImpression.update({
      where: { id: impressionId },
      data: { 
        skipped: true,
        watchTime,
      },
    }),
    db.ad.update({
      where: { id: adId },
      data: { skips: { increment: 1 } },
    }),
  ]);
};

export const createAd = async (data: {
  title: string;
  description?: string;
  type: AdType;
  imageUrl?: string;
  videoUrl?: string;
  clickUrl?: string;
  duration?: number;
  skipAfter?: number;
  cpm: number;
  cpc: number;
  budget: number;
  startDate: Date;
  endDate: Date;
  createdById: string;
  minViewers?: number;
  maxViewers?: number;
  targetPrime?: boolean;
}) => {
  return await db.ad.create({
    data: {
      ...data,
      status: "DRAFT",
    },
  });
};

export const updateAdStatus = async (adId: string, status: AdStatus) => {
  return await db.ad.update({
    where: { id: adId },
    data: { status },
  });
};

export const getAdStats = async (adId: string) => {
  const ad = await db.ad.findUnique({
    where: { id: adId },
    include: {
      impressionLogs: {
        select: {
          shown: true,
          completed: true,
          clicked: true,
          skipped: true,
          watchTime: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!ad) return null;

  const ctr = ad.impressions > 0 
    ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
    : '0.00';
    
  const completionRate = ad.impressions > 0
    ? ((ad.completions / ad.impressions) * 100).toFixed(2)
    : '0.00';
    
  const skipRate = ad.impressions > 0
    ? ((ad.skips / ad.impressions) * 100).toFixed(2)
    : '0.00';

  return {
    ...ad,
    ctr,
    completionRate,
    skipRate,
    budgetRemaining: Number(ad.budget) - Number(ad.spent),
    budgetUsedPercent: Number(ad.budget) > 0
      ? ((Number(ad.spent) / Number(ad.budget)) * 100).toFixed(2)
      : '0.00',
  };
};

export const getActiveAdsByType = async (isPrime: boolean = false) => {
  const now = new Date();
  
  return await db.ad.findMany({
    where: {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
      ...(isPrime ? { targetPrime: true } : {}),
    },
    include: {
      createdBy: {
        select: {
          username: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const deleteAd = async (adId: string) => {
  return await db.ad.delete({
    where: { id: adId },
  });
};