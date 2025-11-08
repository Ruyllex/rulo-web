import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createLiveKitToken } from "@/lib/livekit-service";

export async function POST(req: Request) {
  const { roomName, role } = await req.json();
  if (!roomName) return new NextResponse("Missing roomName", { status: 400 });

  const { userId } = auth();
  const isHost = role === "host";

  if (isHost && !userId) return new NextResponse("Unauthorized", { status: 401 });

  const identity = userId ?? `anon-${crypto.randomUUID().slice(0, 8)}`;

  const token = createLiveKitToken({
    identity,
    roomName,
    isPublisher: isHost,
  });

  return NextResponse.json({ token });
}
