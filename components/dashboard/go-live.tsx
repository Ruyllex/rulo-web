"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RadioTower } from "lucide-react";

export function GoLiveButton({ className }: { className?: string }) {
  return (
    <Link href="/u/studio" prefetch>
      <Button className={`flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white ${className ?? ""}`}>
        <RadioTower className="h-4 w-4" />
        Ir en vivo
      </Button>
    </Link>
  );
}
