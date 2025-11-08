// app/api/chat/[streamId]/clear/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clearChat } from "@/lib/chat-service";
import { currentUser } from "@clerk/nextjs";

// DELETE - Limpiar todos los mensajes del chat (solo streamer)
export async function DELETE(
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

    // Limpiar chat (la función verifica que sea el streamer)
    const result = await clearChat(streamId);

    return NextResponse.json({
      success: true,
      message: "Chat limpiado correctamente",
      deletedCount: result.count,
    });
  } catch (error: any) {
    console.error("[CHAT_CLEAR]", error);

    if (error.message.includes("autorizado")) {
      return NextResponse.json(
        { error: "Solo el streamer puede limpiar el chat" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al limpiar el chat" },
      { status: 500 }
    );
  }
}