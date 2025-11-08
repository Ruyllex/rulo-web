import { redirect } from "next/navigation";
import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { ShowcaseClient } from "./showcase-client";

export default async function ShowcasePage() {
  // Obtener usuario actual
  let user;
  try {
    user = await getSelf();
  } catch {
    redirect("/");
  }

  // Obtener paquetes de Solcitos activos
  let packages = await db.solcitoPackage.findMany({
    where: {
      active: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Si no hay paquetes, crear los por defecto
  if (packages.length === 0) {
    await createDefaultPackages();
    packages = await db.solcitoPackage.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
  }

  // Obtener estadísticas si es streamer
  let stats = null;
  
  if (user.isStreamer) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalDonations,
      totalSubscribers,
      thisMonthDonations,
    ] = await Promise.all([
      db.directDonation.aggregate({
        where: {
          toStreamerId: user.id,
          status: 'completed',
        },
        _sum: { amount: true },
      }),
      db.channelSubscription.count({
        where: {
          streamerId: user.id,
          status: 'active',
        },
      }),
      db.directDonation.aggregate({
        where: {
          toStreamerId: user.id,
          status: 'completed',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalEarnings = Number(user.availableBalance) + Number(totalDonations._sum.amount || 0);
    
    stats = {
      totalEarnings,
      thisMonthEarnings: Number(thisMonthDonations._sum.amount || 0),
      totalDonations: Number(totalDonations._sum.amount || 0),
      totalSubscribers,
    };
  }

  // Preparar datos para el client component
  const userData = {
    id: user.id,
    username: user.username,
    solcitosBalance: user.solcitosBalance,
    totalSolcitosEarned: user.totalSolcitosEarned,
    availableBalance: Number(user.availableBalance),
    isStreamer: user.isStreamer,
  };

  const packagesData = packages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    amount: pkg.amount,
    bonus: pkg.bonus,
    price: Number(pkg.price),
    order: pkg.order,
  }));

  return <ShowcaseClient user={userData} packages={packagesData} stats={stats} />;
}

async function createDefaultPackages() {
  const defaultPackages = [
    { name: "Paquete Básico", amount: 95, price: 1.99, bonus: 0, order: 1 },
    { name: "Paquete Pequeño", amount: 245, price: 2.99, bonus: 0, order: 2 },
    { name: "Paquete Mediano", amount: 510, price: 4.99, bonus: 0, order: 3 },
    { name: "Paquete Popular", amount: 1050, price: 8.99, bonus: 0, order: 4 },
    { name: "Paquete Grande", amount: 2750, price: 10.99, bonus: 100, order: 5 },
    { name: "Paquete Premium", amount: 5550, price: 15.99, bonus: 250, order: 6 },
    { name: "Paquete Mega", amount: 11500, price: 20.99, bonus: 500, order: 7 },
  ];

  await db.solcitoPackage.createMany({
    data: defaultPackages.map(pkg => ({
      ...pkg,
      active: true,
    })),
  });
}