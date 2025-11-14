import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { createIngress } from "@/lib/livekit-service";

// ** AJUSTE PARA FORZAR RENDERIZADO DINÁMICO **
// Esto le dice a Next.js que esta ruta DEBE ejecutarse en el servidor
// para cada solicitud, ya que depende de datos de tiempo de ejecución
// (como la autenticación del usuario a través de headers).
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // El uso de currentUser() es lo que fuerza el dinamismo. Es necesario.
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

    // Si ya es streamer, no hacer nada
    if (dbUser.isStreamer) {
      return NextResponse.json({
        success: true,
        message: "User is already a streamer",
        user: dbUser,
      });
    }

    console.log("Creating ingress for user:", dbUser.username);

    // Crear el ingress en LiveKit PRIMERO
    let ingress;
    try {
      ingress = await createIngress(dbUser.id, dbUser.username);
      console.log("Ingress created successfully:", ingress.url);
    } catch (error) {
      console.error("Failed to create ingress:", error);
      throw new Error("Failed to create streaming credentials");
    }

    // Actualizar usuario a streamer CON las credenciales
    const updatedUser = await db.user.update({
      where: { id: dbUser.id },
      data: {
        isStreamer: true,
        streamKey: ingress.streamKey,
        serverUrl: ingress.url,
      },
    });

    // Crear stream si no existe
    const existingStream = await db.stream.findUnique({
      where: { userId: dbUser.id },
    });

    if (!existingStream) {
      await db.stream.create({
        data: {
          name: `Stream de ${dbUser.username}`,
          userId: dbUser.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully became a streamer",
      user: updatedUser,
      ingress: {
        url: ingress.url,
        streamKey: ingress.streamKey,
      },
    });
  } catch (error) {
    console.error("Error becoming streamer:", error);
    
    // Dar más detalles del error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { 
        error: "Failed to become streamer",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}