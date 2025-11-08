// app/api/cron/check-expired/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkExpiredMemberships } from '@/lib/prime-service';

export async function GET(req: NextRequest) {
  try {
    // Verificar autorización (token secret para cron jobs)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const expiredCount = await checkExpiredMemberships();

    return NextResponse.json({
      success: true,
      expiredCount,
      message: `Se procesaron ${expiredCount} membresías expiradas`
    });

  } catch (error) {
    console.error('[CHECK_EXPIRED_API_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al verificar membresías' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';