// app/api/chat/[streamId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getChatMessages,
  sendChatMessage,
  getChatSettings,
} from "@/lib/chat-service";
import { currentUser } from "@clerk/nextjs";

// GET - Obtener mensajes del chat y configuración
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

    // Obtener mensajes y configuración
    const messages = await getChatMessages(streamId, 100);
    const settings = await getChatSettings(streamId);

    return NextResponse.json({
      messages,
      settings,
      success: true,
    });
  } catch (error) {
    console.error("[CHAT_GET]", error);
    return NextResponse.json(
      { error: "Error al cargar mensajes" },
      { status: 500 }
    );
  }
}

// POST - Enviar nuevo mensaje al chat
export async function POST(
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
    const { message, solcitos } = body;

    // Validaciones
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "El mensaje no puede estar vacío" },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: "El mensaje es demasiado largo (máximo 500 caracteres)" },
        { status: 400 }
      );
    }

    // Validar solcitos si se envían
    if (solcitos !== undefined) {
      if (typeof solcitos !== "number" || solcitos < 0) {
        return NextResponse.json(
          { error: "Cantidad de Solcitos inválida" },
          { status: 400 }
        );
      }
    }

    // Enviar mensaje
    const chatMessage = await sendChatMessage(streamId, message, solcitos);

    return NextResponse.json({
      message: chatMessage,
      success: true,
    });
  } catch (error: any) {
    console.error("[CHAT_POST]", error);
    
    // Manejar errores específicos
    if (error.message.includes("deshabilitado")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error.message.includes("seguir")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error.message.includes("suscriptores")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error.message.includes("palabras no permitidas")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al enviar mensaje" },
      { status: 500 }
    );
  }
}