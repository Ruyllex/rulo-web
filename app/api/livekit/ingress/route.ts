// app/api/livekit/ingress/route.ts
import { NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const self = await getSelf();
    
    if (!self || !self.isStreamer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Para LiveKit Cloud, usar las URLs estándar
    const serverUrl = "rtmps://global-live.livekit.cloud/live";
    const streamKey = self.streamKey || `sk_${self.id}`;

    // Actualizar el stream key en la DB si no existe
    if (!self.streamKey) {
      await db.user.update({
        where: { id: self.id },
        data: { 
          streamKey: streamKey,
          serverUrl: serverUrl 
        }
      });
    }

    return NextResponse.json({
      serverUrl,
      streamKey,
      playbackUrl: `https://yourdomain.com/${self.username}`
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}