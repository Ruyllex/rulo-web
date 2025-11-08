import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";

// POST - Enviar Solcitos a otro usuario
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { recipientId, amount } = body;

    // Validaciones
    if (!recipientId || !amount) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Cantidad inválida" },
        { status: 400 }
      );
    }

    // Obtener el usuario que envía (sender)
    const sender = await db.user.findUnique({
      where: { externalUserId: user.id },
    });

    if (!sender) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que no se envíe a sí mismo
    if (sender.id === recipientId) {
      return NextResponse.json(
        { error: "No puedes enviarte Solcitos a ti mismo" },
        { status: 400 }
      );
    }

    // Verificar balance suficiente
    if (sender.solcitosBalance < amount) {
      return NextResponse.json(
        { error: `No tienes suficientes Solcitos. Tienes ${sender.solcitosBalance} y necesitas ${amount}` },
        { status: 400 }
      );
    }

    // Obtener el usuario que recibe (recipient)
    const recipient = await db.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Usuario destinatario no encontrado" },
        { status: 404 }
      );
    }

    // Realizar la transacción
    const [updatedSender, updatedRecipient] = await db.$transaction([
      // Descontar del sender
      db.user.update({
        where: { id: sender.id },
        data: {
          solcitosBalance: {
            decrement: amount,
          },
        },
      }),

      // Agregar al recipient
      db.user.update({
        where: { id: recipientId },
        data: {
          solcitosBalance: {
            increment: amount,
          },
          totalSolcitosEarned: {
            increment: amount,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Enviaste ${amount} Solcitos a ${recipient.username}`,
      newBalance: updatedSender.solcitosBalance,
    });
  } catch (error: any) {
    console.error("[SOLCITOS_SEND]", error);
    return NextResponse.json(
      { error: error.message || "Error al enviar Solcitos" },
      { status: 500 }
    );
  }
}