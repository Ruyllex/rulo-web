// app/prime/page.tsx
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { PrimeMembership } from '@/components/prime/prime-membership';

export default async function PrimePage() {
  try {
    // Obtener usuario de Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      redirect('/sign-in');
    }

    // Buscar usuario en la base de datos
    const user = await db.user.findUnique({
      where: { 
        externalUserId: clerkUser.id 
      },
      include: {
        primeMemberships: {
          where: {
            status: {
              in: ['active', 'canceled']
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!user) {
      // Si el usuario no existe en la BD, redirigir a setup
      redirect('/setup-username');
    }

    return (
      <PrimeMembership 
        user={{
          id: user.id,
          username: user.username,
          isPrime: user.isPrime,
          primeMemberships: user.primeMemberships.map(m => ({
            status: m.status,
            endDate: m.endDate
          }))
        }}
      />
    );
  } catch (error) {
    console.error('[PRIME_PAGE_ERROR]', error);
    redirect('/sign-in');
  }
}