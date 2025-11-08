// app/api/ingress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { createIngress, resetIngresses } from "@/lib/livekit-service";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Buscar el usuario en la BD
    const dbUser = await db.user.findUnique({
      where: { externalUserId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verificar que sea streamer
    if (!dbUser.isStreamer) {
      return NextResponse.json(
        { error: "Not a streamer" },
        { status: 403 }
      );
    }

    // Crear el ingress en LiveKit
    const ingress = await createIngress(dbUser.id, dbUser.username);

    // Guardar las credenciales en la BD
    await db.user.update({
      where: { id: dbUser.id },
      data: {
        streamKey: ingress.streamKey,
        serverUrl: ingress.url,
      },
    });

    return NextResponse.json({
      success: true,
      ingress: {
        url: ingress.url,
        streamKey: ingress.streamKey,
      },
    });
  } catch (error) {
    console.error("Error creating ingress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Endpoint para regenerar ingress
export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dbUser = await db.user.findUnique({
      where: { externalUserId: user.id },
    });

    if (!dbUser || !dbUser.isStreamer) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    // Resetear ingresses
    await resetIngresses(dbUser.id);

    // Crear nuevo ingress
    const ingress = await createIngress(dbUser.id, dbUser.username);

    // Actualizar BD
    await db.user.update({
      where: { id: dbUser.id },
      data: {
        streamKey: ingress.streamKey,
        serverUrl: ingress.url,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Stream key regenerated",
      ingress: {
        url: ingress.url,
        streamKey: ingress.streamKey,
      },
    });
  } catch (error) {
    console.error("Error resetting ingress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}