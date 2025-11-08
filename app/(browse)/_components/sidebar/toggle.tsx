"use client";

import React from "react";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";

import { useSidebar } from "@/store/use-sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Hint } from "@/components/hint";

export function Toggle() {
  const { collapsed, onExpand, onCollapse } = useSidebar((state) => state);

  const label = collapsed ? "Expand" : "Collapse";

  return (
    <>
      {collapsed && (
        <div className="hidden lg:flex w-full items-center justify-center pt-4 mb-4">
          <Hint label={label} side="right" asChild>
            <Button 
              variant="ghost" 
              onClick={onExpand} 
              className="h-auto p-2 hover:bg-cyan-500/10 hover:text-cyan-500 transition-all group"
            >
              <ArrowRightFromLine className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
            </Button>
          </Hint>
        </div>
      )}
      {!collapsed && (
        <div className="p-3 pl-6 mb-2 flex items-center w-full border-b border-cyan-500/10">
          <p className="font-semibold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent">
            Canales en vivo
          </p>
          <Hint label={label} side="right" asChild>
            <Button
              className="h-auto ml-auto p-2 hover:bg-cyan-500/10 hover:text-cyan-500 transition-all group"
              variant="ghost"
              onClick={onCollapse}
            >
              <ArrowLeftFromLine className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
            </Button>
          </Hint>
        </div>
      )}
    </>
  );
}

export function ToggleSkeleton() {
  return (
    <div className="p-3 pl-6 mb-2 hidden lg:flex items-center justify-between w-full border-b border-cyan-500/10">
      <Skeleton className="h-6 w-[100px] bg-cyan-500/20" />
      <Skeleton className="h-6 w-6 bg-cyan-500/20" />
    </div>
  );
}