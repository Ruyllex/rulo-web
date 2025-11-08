// components/verified-badge.tsx
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function VerifiedBadge({ 
  className, 
  size = "md",
  showText = false 
}: VerifiedBadgeProps) {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (showText) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
        "bg-cyan-500/10 border border-cyan-500/30",
        "text-cyan-600 dark:text-cyan-400",
        className
      )}>
        <CheckCircle2 className={cn(sizes[size], "fill-cyan-500 text-white")} />
        <span className="text-xs font-medium">Verificado</span>
      </div>
    );
  }

  return (
    <CheckCircle2 
      className={cn(
        sizes[size],
        "fill-cyan-500 text-white",
        className
      )} 
    />
  );
}