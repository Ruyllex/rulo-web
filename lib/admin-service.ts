import { db } from "@/lib/db";
import { UserRole, ModerationAction } from "@prisma/client";

// ============================================
// GESTIÓN DE USUARIOS
// ============================================

export const getAllUsers = async (page: number = 1, limit: number = 50) => {
  const skip = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    db.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        stream: {
          select: {
            isLive: true,
            name: true,
          },
        },
        _count: {
          select: {
            following: true,
            followedBy: true,
          },
        },
      },
    }),
    db.user.count(),
  ]);

  return {
    users,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
};

export const searchUsers = async (query: string) => {
  return await db.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 20,
    include: {
      stream: {
        select: {
          isLive: true,
          name: true,
        },
      },
    },
  });
};

export const getUserDetails = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      stream: true,
      following: {
        include: {
          following: {
            select: {
              username: true,
              imageUrl: true,
            },
          },
        },
      },
      followedBy: {
        include: {
          follower: {
            select: {
              username: true,
              imageUrl: true,
            },
          },
        },
      },
      solcitoPurchases: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      moderationActions: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          moderator: {
            select: {
              username: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const stats = {
    totalFollowers: await db.follow.count({ where: { followingId: userId } }),
    totalFollowing: await db.follow.count({ where: { followerId: userId } }),
    totalDonationsReceived: await db.directDonation.aggregate({
      where: { toStreamerId: userId },
      _sum: { amount: true },
    }),
    totalSolcitosReceived: await db.solcitoTransaction.aggregate({
      where: { toStreamerId: userId },
      _sum: { amount: true },
    }),
  };

  return { ...user, stats };
};

export const updateUserRole = async (
  userId: string,
  role: UserRole,
  moderatorId: string,
  reason: string
) => {
  const [user] = await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { role },
    }),
    db.moderationLog.create({
      data: {
        moderatorId,
        userId,
        action: "ROLE_CHANGE",
        reason,
        details: `Role changed to ${role}`,
      },
    }),
  ]);

  return user;
};

export const banUser = async (
  userId: string,
  moderatorId: string,
  reason: string,
  duration?: number
) => {
  const expiresAt = duration 
    ? new Date(Date.now() + duration * 60 * 1000)
    : undefined;

  const [user] = await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: reason,
        bannedAt: new Date(),
        bannedBy: moderatorId,
      },
    }),
    db.moderationLog.create({
      data: {
        moderatorId,
        userId,
        action: "BAN",
        reason,
        duration,
        expiresAt,
        details: duration ? `Banned for ${duration} minutes` : 'Permanent ban',
      },
    }),
  ]);

  return user;
};

export const unbanUser = async (
  userId: string,
  moderatorId: string,
  reason: string
) => {
  const [user] = await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        banReason: null,
        bannedAt: null,
        bannedBy: null,
      },
    }),
    db.moderationLog.create({
      data: {
        moderatorId,
        userId,
        action: "UNBAN",
        reason,
      },
    }),
  ]);

  return user;
};

// ============================================
// ESTADÍSTICAS DE LA PLATAFORMA
// ============================================

export const getPlatformStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalStreamers,
    liveStreamers,
    primeUsers,
    todayStats,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isStreamer: true } }),
    db.stream.count({ where: { isLive: true } }),
    db.user.count({ where: { isPrime: true } }),
    db.platformStats.findUnique({ where: { date: today } }),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    newUsers,
    revenue,
    totalDonations,
    totalSolcitosTransactions,
  ] = await Promise.all([
    db.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    db.directDonation.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: 'completed',
      },
      _sum: { amount: true },
    }),
    db.directDonation.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    db.solcitoTransaction.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  return {
    totalUsers,
    totalStreamers,
    liveStreamers,
    primeUsers,
    newUsersLast30Days: newUsers,
    revenueLast30Days: Number(revenue._sum.amount || 0),
    totalDonationsLast30Days: totalDonations,
    totalSolcitosTransactionsLast30Days: totalSolcitosTransactions,
    todayStats: todayStats || null,
  };
};

export const getRevenueStats = async (days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [
    donations,
    solcitosPurchases,
    primeSubscriptions,
    channelSubscriptions,
  ] = await Promise.all([
    db.directDonation.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: 'completed',
      },
      _sum: { amount: true },
    }),
    db.solcitoPurchase.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: 'completed',
      },
      _sum: { price: true },
    }),
    db.primeMembership.aggregate({
      where: {
        startDate: { gte: startDate },
        status: 'active',
      },
      _sum: { price: true },
    }),
    db.channelSubscription.aggregate({
      where: {
        startDate: { gte: startDate },
        status: 'active',
      },
      _sum: { price: true },
    }),
  ]);

  const donationsRevenue = Number(donations._sum.amount || 0);
  const solcitosRevenue = Number(solcitosPurchases._sum.price || 0);
  const primeRevenue = Number(primeSubscriptions._sum.price || 0);
  const subsRevenue = Number(channelSubscriptions._sum.price || 0);

  const totalRevenue = donationsRevenue + solcitosRevenue + primeRevenue + subsRevenue;

  return {
    totalRevenue,
    donations: donationsRevenue,
    solcitos: solcitosRevenue,
    prime: primeRevenue,
    subscriptions: subsRevenue,
    breakdown: {
      donations: totalRevenue > 0 ? ((donationsRevenue / totalRevenue) * 100).toFixed(2) : '0',
      solcitos: totalRevenue > 0 ? ((solcitosRevenue / totalRevenue) * 100).toFixed(2) : '0',
      prime: totalRevenue > 0 ? ((primeRevenue / totalRevenue) * 100).toFixed(2) : '0',
      subscriptions: totalRevenue > 0 ? ((subsRevenue / totalRevenue) * 100).toFixed(2) : '0',
    },
  };
};

export const getTopStreamers = async (limit: number = 10) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const topByFollowers = await db.user.findMany({
    where: { isStreamer: true },
    take: limit,
    orderBy: {
      followedBy: {
        _count: 'desc',
      },
    },
    include: {
      stream: {
        select: {
          isLive: true,
          averageViewersLast30: true,
        },
      },
      _count: {
        select: {
          followedBy: true,
        },
      },
    },
  });

  const topByRevenue = await db.user.findMany({
    where: { isStreamer: true },
    take: limit,
    orderBy: {
      totalSolcitosEarned: 'desc',
    },
    include: {
      stream: {
        select: {
          isLive: true,
          averageViewersLast30: true,
        },
      },
    },
  });

  return {
    byFollowers: topByFollowers,
    byRevenue: topByRevenue,
  };
};

// ============================================
// LOGS DE MODERACIÓN
// ============================================

export const getModerationLogs = async (
  page: number = 1,
  limit: number = 50,
  filters?: {
    userId?: string;
    moderatorId?: string;
    action?: ModerationAction;
  }
) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(filters?.userId && { userId: filters.userId }),
    ...(filters?.moderatorId && { moderatorId: filters.moderatorId }),
    ...(filters?.action && { action: filters.action }),
  };

  const [logs, total] = await Promise.all([
    db.moderationLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        moderator: {
          select: {
            username: true,
            imageUrl: true,
            role: true,
          },
        },
        user: {
          select: {
            username: true,
            imageUrl: true,
          },
        },
      },
    }),
    db.moderationLog.count({ where }),
  ]);

  return {
    logs,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
};

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================

export const getSystemSettings = async () => {
  return await db.systemSetting.findMany({
    orderBy: { key: 'asc' },
  });
};

export const updateSystemSetting = async (
  key: string,
  value: string
) => {
  return await db.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
};

export const getSystemSetting = async (key: string) => {
  const setting = await db.systemSetting.findUnique({
    where: { key },
  });
  return setting?.value;
};