// app/api/admin/users/verify/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export async function POST(req: Request) {
  try {
    const self = await getSelf();
    
    // Verificar que sea admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(self.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId, isVerified, reason } = await req.json();

    if (!userId) {
      return new NextResponse("User ID required", { status: 400 });
    }

    // Actualizar usuario
    const user = await db.user.update({
      where: { id: userId },
      data: {
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: isVerified ? self.id : null,
      },
    });

    // Registrar en el log de moderación
    try {
      await db.moderationLog.create({
        data: {
          action: isVerified ? 'USER_VERIFIED' : 'USER_UNVERIFIED',
          moderatorId: self.id,
          targetUserId: userId,
          reason: reason || `Usuario ${isVerified ? 'verificado' : 'desverificado'} por ${self.username}`,
          metadata: {
            verifiedAt: isVerified ? new Date().toISOString() : null,
          },
        },
      });
    } catch (logError) {
      console.error("[MODERATION_LOG_ERROR]", logError);
      // Continuar aunque falle el log
    }

    return NextResponse.json({ 
      success: true, 
      user,
      message: isVerified ? 'Usuario verificado exitosamente' : 'Verificación removida'
    });

  } catch (error) {
    console.error("[VERIFY_USER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}