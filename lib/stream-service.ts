// lib/stream-service.ts
import { db } from "@/lib/db";
import crypto from "crypto";

export function generateStreamKey() {
  return `stream_${crypto.randomBytes(16).toString('hex')}`;
}

export async function getUserByUsername(username: string) {
  return await db.user.findUnique({
    where: { username },
    include: {
      stream: true,
    }
  });
}

export const getStreamByUserId = async (userId: string) => {
  const stream = await db.stream.findUnique({
    where: {
      userId,
    },
  });

  return stream;
};