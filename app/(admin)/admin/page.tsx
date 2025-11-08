"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  Activity,
  Crown,
  Video,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  totalStreamers: number;
  liveStreamers: number;
  primeUsers: number;
  newUsersLast30Days: number;
  revenueLast30Days: number;
  totalDonationsLast30Days: number;
  totalSolcitosTransactionsLast30Days: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Usuarios Totales",
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsersLast30Days} este mes`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Streamers Activos",
      value: stats.totalStreamers.toLocaleString(),
      change: `${stats.liveStreamers} en vivo ahora`,
      icon: Video,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Usuarios Prime",
      value: stats.primeUsers.toLocaleString(),
      change: `${((stats.primeUsers / stats.totalUsers) * 100).toFixed(1)}% del total`,
      icon: Crown,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Ingresos (30 días)",
      value: `$${stats.revenueLast30Days.toLocaleString()}`,
      change: `${stats.totalDonationsLast30Days} donaciones`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestiona tu plataforma desde un solo lugar
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.change}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickActionCard
          title="Gestionar Usuarios"
          description="Ver y administrar todos los usuarios"
          icon={Users}
          href="/admin/users"
        />
        <QuickActionCard
          title="Anuncios"
          description="Crear y gestionar campañas publicitarias"
          icon={Eye}
          href="/admin/ads"
        />
        <QuickActionCard
          title="Sponsors"
          description="Administrar patrocinadores"
          icon={TrendingUp}
          href="/admin/sponsors"
        />
        <QuickActionCard
          title="Estadísticas"
          description="Ver métricas detalladas"
          icon={Activity}
          href="/admin/analytics"
        />
        <QuickActionCard
          title="Moderación"
          description="Logs y acciones de moderación"
          icon={AlertCircle}
          href="/admin/moderation"
        />
        <QuickActionCard
          title="Top Streamers"
          description="Ver los streamers más populares"
          icon={Video}
          href="/admin/top-streamers"
        />
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
        <RecentActivityList />
      </Card>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  href,
}: QuickActionCardProps) => {
  return (
    <Link href={href}>
      <Card className="p-6 hover:border-primary transition-colors cursor-pointer group h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </Card>
    </Link>
  );
};

const RecentActivityList = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/activity');
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay actividad reciente
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.slice(0, 10).map((activity, index) => (
        <div
          key={index}
          className="flex items-start gap-4 pb-4 border-b last:border-0"
        >
          <div className="bg-muted p-2 rounded-lg">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.action}</p>
            <p className="text-xs text-muted-foreground">{activity.details}</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(activity.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
};