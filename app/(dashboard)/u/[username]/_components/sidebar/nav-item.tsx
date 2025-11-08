"use client";

import React, { useState } from "react";
import { LucideIcon, ChevronDown } from "lucide-react";
import Link from "next/link";

import { useCreatorSidebar } from "@/store/use-creator-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SubItem {
  label: string;
  href: string;
}

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  subItems?: SubItem[];
}

export function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  subItems,
}: NavItemProps) {
  const { collapsed } = useCreatorSidebar((state) => state);
  const [isExpanded, setIsExpanded] = useState(false);

  // Si tiene subitems, es un dropdown
  const hasSubItems = subItems && subItems.length > 0;

  if (hasSubItems && !collapsed) {
    return (
      <li className="w-full">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          className={cn(
            "w-full h-12 justify-start",
            isActive && "bg-accent"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-x-4">
              <Icon className="h-4 w-4 mr-2" />
              <span>{label}</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "transform rotate-180"
              )}
            />
          </div>
        </Button>
        
        {isExpanded && (
          <ul className="mt-1 ml-6 space-y-1">
            {subItems.map((subItem) => (
              <li key={subItem.href}>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-9 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Link href={subItem.href}>
                    {subItem.label}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  // Item simple sin subitems
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full h-12",
        collapsed ? "justify-center" : "justify-start",
        isActive && "bg-accent"
      )}
    >
      <Link href={href}>
        <div className="flex items-center gap-x-4">
          <Icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
          {!collapsed && <span>{label}</span>}
        </div>
      </Link>
    </Button>
  );
}

export function NavItemSkeleton() {
  return (
    <li className="flex items-center gap-x-4 px-3 py-2">
      <Skeleton className="min-h-[48px] min-w-[48px] rounded-md" />
      <div className="flex-1 hidden lg:block">
        <Skeleton className="h-6" />
      </div>
    </li>
  );
}