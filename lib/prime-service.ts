// lib/prime-service.ts
import { db } from './db';

export const PRIME_PRICE = 3.99;

export interface PrimeBenefits {
  noAds: boolean;
  exclusiveEmojis: boolean;
  vipContent: boolean;
  badge: boolean;
  chatColor: boolean;
}

export const PRIME_BENEFITS: PrimeBenefits = {
  noAds: true,
  exclusiveEmojis: true,
  vipContent: true,
  badge: true,
  chatColor: true
};

// Verificar si un usuario tiene Prime activo
export async function isPrimeUser(userId: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { 
        isPrime: true,
        primeMemberships: {
          where: {
            status: 'active',
            endDate: {
              gte: new Date()
            }
          },
          take: 1
        }
      }
    });

    return user?.isPrime && (user.primeMemberships.length > 0);
  } catch (error) {
    console.error('[IS_PRIME_USER_ERROR]', error);
    return false;
  }
}

// Activar membresía Prime
export async function activatePrime(
  userId: string,
  paymentMethod: string,
  subscriptionId: string,
  durationDays: number = 30
) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + durationDays);

  try {
    // Actualizar usuario
    await db.user.update({
      where: { id: userId },
      data: {
        isPrime: true
      }
    });

    // Crear registro de membresía
    const membership = await db.primeMembership.create({
      data: {
        userId,
        status: 'active',
        price: PRIME_PRICE,
        stripeSubscriptionId: paymentMethod === 'stripe' ? subscriptionId : null,
        mercadoPagoId: paymentMethod === 'mercadopago' ? subscriptionId : null,
        endDate
      }
    });

    return membership;
  } catch (error) {
    console.error('[ACTIVATE_PRIME_ERROR]', error);
    throw new Error('Error al activar Prime');
  }
}

// Cancelar membresía Prime
export async function cancelPrime(userId: string) {
  try {
    const membership = await db.primeMembership.findFirst({
      where: {
        userId,
        status: 'active'
      }
    });

    if (!membership) {
      throw new Error('No se encontró membresía activa');
    }

    // Actualizar membresía
    await db.primeMembership.update({
      where: { id: membership.id },
      data: {
        status: 'canceled',
        canceledAt: new Date()
      }
    });

    // Usuario sigue siendo Prime hasta que expire
    // No actualizamos isPrime aquí, se hace cuando expire la fecha

    return { success: true, expiresAt: membership.endDate };
  } catch (error) {
    console.error('[CANCEL_PRIME_ERROR]', error);
    throw error;
  }
}

// Renovar membresía Prime (llamado por webhook de pago)
export async function renewPrime(userId: string, subscriptionId: string) {
  try {
    const membership = await db.primeMembership.findFirst({
      where: {
        userId,
        OR: [
          { stripeSubscriptionId: subscriptionId },
          { mercadoPagoId: subscriptionId }
        ]
      }
    });

    if (!membership) {
      throw new Error('Membresía no encontrada');
    }

    // Extender 30 días desde la fecha actual de expiración
    const newEndDate = new Date(membership.endDate);
    newEndDate.setDate(newEndDate.getDate() + 30);

    await db.primeMembership.update({
      where: { id: membership.id },
      data: {
        endDate: newEndDate,
        status: 'active'
      }
    });

    await db.user.update({
      where: { id: userId },
      data: { isPrime: true }
    });

    return { success: true };
  } catch (error) {
    console.error('[RENEW_PRIME_ERROR]', error);
    throw error;
  }
}

// Verificar membresías expiradas (ejecutar con cron job)
export async function checkExpiredMemberships() {
  try {
    const expiredMemberships = await db.primeMembership.findMany({
      where: {
        status: 'active',
        endDate: {
          lt: new Date()
        }
      }
    });

    for (const membership of expiredMemberships) {
      // Desactivar Prime del usuario
      await db.user.update({
        where: { id: membership.userId },
        data: { isPrime: false }
      });

      // Marcar membresía como expirada
      await db.primeMembership.update({
        where: { id: membership.id },
        data: { status: 'expired' }
      });

      console.log(`⏰ Membresía Prime expirada para usuario ${membership.userId}`);
    }

    return expiredMemberships.length;
  } catch (error) {
    console.error('[CHECK_EXPIRED_ERROR]', error);
    return 0;
  }
}