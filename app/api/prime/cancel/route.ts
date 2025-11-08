// app/api/prime/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSelf } from '@/lib/auth-service';
import { cancelPrime } from '@/lib/prime-service';

export async function POST(req: NextRequest) {
  try {
    const self = await getSelf();

    if (!self.isPrime) {
      return NextResponse.json(
        { error: 'No tienes membresía Prime activa' },
        { status: 400 }
      );
    }

    const result = await cancelPrime(self.id);

    return NextResponse.json({
      success: true,
      message: 'Membresía cancelada. Seguirás teniendo acceso hasta la fecha de expiración.',
      expiresAt: result.expiresAt
    });

  } catch (error) {
    console.error('[PRIME_CANCEL_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al cancelar membresía' },
      { status: 500 }
    );
  }
}