import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getSelf } from "@/lib/auth-service";
import {
  getAdForStream,
  recordAdImpression,
} from "@/lib/ad-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as any;
    const viewerCount = parseInt(searchParams.get('viewers') || '0');

    const { userId } = auth();
    let isPrime = false;

    if (userId) {
      try {
        const user = await getSelf();
        isPrime = user.isPrime;
      } catch {
        // Usuario no autenticado
      }
    }

    // Prime users no ven anuncios
    if (isPrime) {
      return NextResponse.json({ ad: null });
    }

    const ad = await getAdForStream(type, viewerCount, isPrime);

    if (!ad) {
      return NextResponse.json({ ad: null });
    }

    // Registrar impresión
    const impression = await recordAdImpression(
      ad.id,
      userId || null,
      null,
      {
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      }
    );

    return NextResponse.json({
      ad,
      impressionId: impression.id,
    });
  } catch (error) {
    console.error('[ADS_GET]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}