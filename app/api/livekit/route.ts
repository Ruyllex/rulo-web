// app/api/livekit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createViewerToken } from "@/lib/livekit-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");
    const username = searchParams.get("username");

    if (!room || !username) {
      return NextResponse.json(
        { error: "Missing room or username parameter" },
        { status: 400 }
      );
    }

    // Crear token de viewer
    const token = await createViewerToken(username, room);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error creating viewer token:", error);
    return NextResponse.json(
      { error: "Failed to create viewer token" },
      { status: 500 }
    );
  }
}