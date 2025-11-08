import { redirect } from "next/navigation";
import { getSelf } from "@/lib/auth-service";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Monitor, 
  TrendingUp, 
  Shield,
  BarChart3,
  Settings 
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let self;
  
  try {
    self = await getSelf();
  } catch {
    redirect("/");
  }

  // Solo admins y moderadores
  if (
    self.role !== "ADMIN" &&
    self.role !== "SUPER_ADMIN" &&
    self.role !== "MODERATOR"
  ) {
    redirect("/");
  }

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/users",
      label: "Usuarios",
      icon: Users,
    },
    {
      href: "/admin/ads",
      label: "Anuncios",
      icon: Monitor,
    },
    {
      href: "/admin/sponsors",
      label: "Sponsors",
      icon: TrendingUp,
    },
    {
      href: "/admin/moderation",
      label: "Moderación",
      icon: Shield,
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="font-bold text-xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Admin Panel
              </Link>
              
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{self.username}</p>
                <p className="text-xs text-muted-foreground">{self.role}</p>
              </div>
              <Link
                href="/"
                className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Volver al sitio
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}