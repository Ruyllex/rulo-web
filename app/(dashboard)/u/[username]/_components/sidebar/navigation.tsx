"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  Play, 
  DollarSign, 
  Trophy, 
  Video, 
  UserSquare, 
  Settings 
} from "lucide-react";

import { NavItem, NavItemSkeleton } from "./nav-item";

interface DbUser {
  username: string;
  externalUserId: string;
}

export function Navigation() {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDbUser() {
      if (!clerkUser?.id) return;

      try {
        const response = await fetch(`/api/user/me`);
        if (response.ok) {
          const data = await response.json();
          setDbUser(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDbUser();
  }, [clerkUser?.id]);

  const username = dbUser?.username;

  const routes = [
    {
      label: "Stream",
      href: `/u/${username}/stream`,
      icon: Play,
    },
    {
      label: "Ingresos",
      href: `/u/${username}/ingresos`,
      icon: DollarSign,
    },
    {
      label: "Logros",
      href: `/u/${username}/logros`,
      icon: Trophy,
    },
    {
      label: "Estudio",
      href: `/u/${username}/studio`,
      icon: Video,
      subItems: [
        {
          label: "Dashboard",
          href: `/u/${username}/studio`,
        },
        {
          label: "Mi Stream",
          href: `/u/${username}/stream`,
        },
        {
          label: "Stream Keys",
          href: `/u/${username}/keys`,
        },
      ],
    },
    {
      label: "Canal",
      href: `/u/${username}/canal`,
      icon: UserSquare,
      subItems: [
        {
          label: "Perfil",
          href: `/u/${username}/canal/perfil`,
        },
        {
          label: "Chat Settings",
          href: `/u/${username}/chat`,
        },
        {
          label: "Comunidad",
          href: `/u/${username}/community`,
        },
      ],
    },
    {
      label: "Ajustes",
      href: `/u/${username}/ajustes`,
      icon: Settings,
      subItems: [
        {
          label: "General",
          href: `/u/${username}/ajustes/general`,
        },
        {
          label: "Notificaciones",
          href: `/u/${username}/ajustes/notificaciones`,
        },
        {
          label: "Privacidad",
          href: `/u/${username}/ajustes/privacidad`,
        },
      ],
    },
  ];

  if (isLoading || !username) {
    return (
      <ul className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <NavItemSkeleton key={i} />
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-2 px-2 pt-4 lg:pt-0">
      {routes.map((route) => (
        <NavItem
          key={route.href}
          {...route}
          isActive={pathname === route.href}
        />
      ))}
    </ul>
  );
}