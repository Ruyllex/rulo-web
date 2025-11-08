import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { state } = await req.json();
  const isLive = state === "start";

  const updated = await db.stream.upsert({
    where: { userId },
    create: { userId, isLive },
    update: { isLive },
  });

  return NextResponse.json({ isLive: updated.isLive });
}
