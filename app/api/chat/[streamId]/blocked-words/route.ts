// app/api/chat/[streamId]/blocked-words/route.ts
import { NextRequest, NextResponse } from "next/server";
import { addBlockedWord, removeBlockedWord } from "@/lib/chat-service";
import { currentUser } from "@clerk/nextjs";

// POST - Agregar palabra bloqueada
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
    const { word } = body;

    if (!word || typeof word !== "string" || word.trim().length === 0) {
      return NextResponse.json(
        { error: "Palabra inválida" },
        { status: 400 }
      );
    }

    const settings = await addBlockedWord(streamId, word.trim());

    return NextResponse.json({
      success: true,
      message: "Palabra bloqueada agregada",
      blockedWords: settings.blockedWords,
    });
  } catch (error: any) {
    console.error("[BLOCKED_WORDS_POST]", error);

    if (error.message.includes("autorizado")) {
      return NextResponse.json(
        { error: "Solo el streamer puede bloquear palabras" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al agregar palabra bloqueada" },
      { status: 500 }
    );
  }
}

// DELETE - Remover palabra bloqueada
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

    // Obtener palabra del query string
    const { searchParams } = new URL(req.url);
    const word = searchParams.get("word");

    if (!word || word.trim().length === 0) {
      return NextResponse.json(
        { error: "Palabra requerida" },
        { status: 400 }
      );
    }

    const settings = await removeBlockedWord(streamId, word.trim());

    return NextResponse.json({
      success: true,
      message: "Palabra bloqueada removida",
      blockedWords: settings.blockedWords,
    });
  } catch (error: any) {
    console.error("[BLOCKED_WORDS_DELETE]", error);

    if (error.message.includes("autorizado")) {
      return NextResponse.json(
        { error: "Solo el streamer puede desbloquear palabras" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al remover palabra bloqueada" },
      { status: 500 }
    );
  }
}