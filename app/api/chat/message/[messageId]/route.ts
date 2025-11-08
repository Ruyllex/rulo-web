// app/api/chat/message/[messageId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteChatMessage } from "@/lib/chat-service";
import { currentUser } from "@clerk/nextjs";

// DELETE - Eliminar mensaje individual
export async function DELETE(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { messageId } = params;

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID requerido" },
        { status: 400 }
      );
    }

    // Eliminar mensaje (la función verifica permisos internamente)
    await deleteChatMessage(messageId);

    return NextResponse.json({
      success: true,
      message: "Mensaje eliminado correctamente",
    });
  } catch (error: any) {
    console.error("[CHAT_MESSAGE_DELETE]", error);

    if (error.message.includes("no encontrado")) {
      return NextResponse.json(
        { error: "Mensaje no encontrado" },
        { status: 404 }
      );
    }

    if (error.message.includes("autorizado")) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este mensaje" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al eliminar mensaje" },
      { status: 500 }
    );
  }
}