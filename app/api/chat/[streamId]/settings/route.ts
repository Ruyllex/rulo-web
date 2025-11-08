// app/api/chat/[streamId]/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateChatSettings, getChatSettings } from "@/lib/chat-service";
import { currentUser } from "@clerk/nextjs";

// GET - Obtener configuración del chat
export async function GET(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const { streamId } = params;

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID requerido" },
        { status: 400 }
      );
    }

    const settings = await getChatSettings(streamId);

    return NextResponse.json({
      settings,
      success: true,
    });
  } catch (error) {
    console.error("[CHAT_SETTINGS_GET]", error);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar configuración del chat (solo el streamer)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { streamId } = params;

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID requerido" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validar que solo se envíen campos permitidos
    const allowedFields = [
      "isChatEnabled",
      "isChatDelayed",
      "chatDelaySeconds",
      "isChatFollowersOnly",
      "isChatSubscribersOnly",
      "slowModeSeconds",
    ];

    const data: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    // Validaciones específicas
    if (data.chatDelaySeconds !== undefined) {
      if (typeof data.chatDelaySeconds !== "number" || data.chatDelaySeconds < 0) {
        return NextResponse.json(
          { error: "Delay inválido" },
          { status: 400 }
        );
      }
    }

    if (data.slowModeSeconds !== undefined) {
      if (typeof data.slowModeSeconds !== "number" || data.slowModeSeconds < 0) {
        return NextResponse.json(
          { error: "Slow mode inválido" },
          { status: 400 }
        );
      }
    }

    // Actualizar configuración
    const settings = await updateChatSettings(streamId, data);

    return NextResponse.json({
      settings,
      success: true,
    });
  } catch (error: any) {
    console.error("[CHAT_SETTINGS_PATCH]", error);

    if (error.message.includes("autorizado")) {
      return NextResponse.json(
        { error: "No autorizado para cambiar esta configuración" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}