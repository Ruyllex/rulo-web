import { db } from "@/lib/db";
import { SponsorType, SponsorStatus } from "@prisma/client";

export const getPlatformSponsors = async () => {
  const now = new Date();
  
  return await db.sponsor.findMany({
    where: {
      type: "PLATFORM",
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });
};

export const getStreamerSponsors = async (streamerId: string) => {
  const now = new Date();
  
  return await db.sponsor.findMany({
    where: {
      type: "STREAMER",
      streamerId,
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });
};

export const getAllActiveSponsors = async () => {
  const now = new Date();
  
  return await db.sponsor.findMany({
    where: {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      streamer: {
        select: {
          username: true,
          imageUrl: true,
        },
      },
    },
    orderBy: [
      { type: 'asc' },
      { displayOrder: 'asc' },
    ],
  });
};

export const createSponsor = async (data: {
  name: string;
  description?: string;
  type: SponsorType;
  streamerId?: string;
  logoUrl: string;
  bannerUrl?: string;
  websiteUrl?: string;
  affiliateCode?: string;
  affiliateUrl?: string;
  monthlyAmount: number;
  revenueShare?: number;
  displayOrder?: number;
  showOnStream?: boolean;
  showOnProfile?: boolean;
  startDate: Date;
  endDate: Date;
  autoRenew?: boolean;
  contactEmail?: string;
  notes?: string;
}) => {
  return await db.sponsor.create({
    data: {
      ...data,
      status: "PENDING",
    },
  });
};

export const updateSponsorStatus = async (
  sponsorId: string, 
  status: SponsorStatus
) => {
  return await db.sponsor.update({
    where: { id: sponsorId },
    data: { status },
  });
};

export const updateSponsor = async (
  sponsorId: string,
  data: Partial<{
    name: string;
    description: string;
    logoUrl: string;
    bannerUrl: string;
    websiteUrl: string;
    affiliateCode: string;
    affiliateUrl: string;
    monthlyAmount: number;
    revenueShare: number;
    displayOrder: number;
    showOnStream: boolean;
    showOnProfile: boolean;
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    contactEmail: string;
    notes: string;
  }>
) => {
  return await db.sponsor.update({
    where: { id: sponsorId },
    data,
  });
};

export const recordSponsorClick = async (sponsorId: string) => {
  return await db.sponsor.update({
    where: { id: sponsorId },
    data: {
      clicks: { increment: 1 },
    },
  });
};

export const recordSponsorConversion = async (sponsorId: string) => {
  return await db.sponsor.update({
    where: { id: sponsorId },
    data: {
      conversions: { increment: 1 },
    },
  });
};

export const getSponsorStats = async (sponsorId: string) => {
  const sponsor = await db.sponsor.findUnique({
    where: { id: sponsorId },
    include: {
      streamer: {
        select: {
          username: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!sponsor) return null;

  const ctr = sponsor.clicks > 0
    ? ((sponsor.conversions / sponsor.clicks) * 100).toFixed(2)
    : '0.00';

  const daysActive = Math.ceil(
    (new Date().getTime() - sponsor.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const daysRemaining = Math.ceil(
    (sponsor.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    ...sponsor,
    ctr,
    daysActive,
    daysRemaining,
    totalRevenue: Number(sponsor.monthlyAmount) * (daysActive / 30),
  };
};

export const getExpiringSponsorships = async (days: number = 30) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return await db.sponsor.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        lte: futureDate,
        gte: new Date(),
      },
      autoRenew: false,
    },
    include: {
      streamer: {
        select: {
          username: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      endDate: 'asc',
    },
  });
};

export const renewSponsorship = async (sponsorId: string, months: number = 1) => {
  const sponsor = await db.sponsor.findUnique({
    where: { id: sponsorId },
  });

  if (!sponsor) return null;

  const newEndDate = new Date(sponsor.endDate);
  newEndDate.setMonth(newEndDate.getMonth() + months);

  return await db.sponsor.update({
    where: { id: sponsorId },
    data: {
      endDate: newEndDate,
      status: "ACTIVE",
    },
  });
};

export const deleteSponsor = async (sponsorId: string) => {
  return await db.sponsor.delete({
    where: { id: sponsorId },
  });
};

export const getStreamerSponsorRevenue = async (streamerId: string) => {
  const sponsors = await db.sponsor.findMany({
    where: {
      streamerId,
      status: "ACTIVE",
    },
  });

  const totalMonthly = sponsors.reduce(
    (sum, sponsor) => sum + Number(sponsor.monthlyAmount) * Number(sponsor.revenueShare),
    0
  );

  return {
    totalMonthly,
    activeSponsors: sponsors.length,
    sponsors,
  };
};