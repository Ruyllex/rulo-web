import { redirect } from "next/navigation";
import { getSelfByUsername } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { IngresosClient } from "./_components/ingresos-client";

interface IngresosPageProps {
  params: {
    username: string;
  };
}

export default async function IngresosPage({ params }: IngresosPageProps) {
  const self = await getSelfByUsername(params.username);

  if (!self) {
    redirect("/");
  }

  // Obtener estadísticas del streamer
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalDonations,
    totalSubscribers,
    thisMonthDonations,
    solcitosReceived,
    recentTransactions,
  ] = await Promise.all([
    db.directDonation.aggregate({
      where: {
        toStreamerId: self.id,
        status: 'completed',
      },
      _sum: { amount: true },
    }),
    db.channelSubscription.count({
      where: {
        streamerId: self.id,
        status: 'active',
      },
    }),
    db.directDonation.aggregate({
      where: {
        toStreamerId: self.id,
        status: 'completed',
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    }),
    db.solcitoTransaction.aggregate({
      where: {
        toStreamerId: self.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    }),
    // Obtener últimas transacciones
    db.directDonation.findMany({
      where: {
        toStreamerId: self.id,
        status: 'completed',
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        fromUser: {
          select: {
            username: true,
          },
        },
      },
    }),
  ]);

  const totalEarnings = Number(self.availableBalance) + Number(totalDonations._sum.amount || 0);

  const stats = {
    totalEarnings,
    availableBalance: Number(self.availableBalance),
    thisMonthEarnings: Number(thisMonthDonations._sum.amount || 0),
    totalDonations: Number(totalDonations._sum.amount || 0),
    totalSubscribers,
    thisMonthSolcitos: solcitosReceived._sum.amount || 0,
  };

  const userData = {
    id: self.id,
    username: self.username,
    solcitosBalance: self.solcitosBalance,
    totalSolcitosEarned: self.totalSolcitosEarned,
    availableBalance: Number(self.availableBalance),
  };

  // Formatear transacciones
  const transactions = recentTransactions.map(t => ({
    id: t.id,
    date: t.createdAt.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }),
    amount: Number(t.amount),
    type: 'Donación',
    from: t.fromUser?.username || 'Anónimo',
  }));

  return (
    <IngresosClient 
      user={userData} 
      stats={stats}
      transactions={transactions}
    />
  );
}