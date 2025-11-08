import Image from "next/image";
import { cn } from "@/lib/utils";

interface SolcitoIconProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  amount?: number;
  showAmount?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { icon: 12, text: "text-xs" },
  sm: { icon: 16, text: "text-sm" },
  md: { icon: 20, text: "text-base" },
  lg: { icon: 24, text: "text-lg" },
  xl: { icon: 32, text: "text-xl" },
};

export function SolcitoIcon({
  size = "md",
  amount,
  showAmount = true,
  animated = false,
  className,
}: SolcitoIconProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div
        className={cn(
          "relative flex-shrink-0",
          animated && "animate-bounce"
        )}
      >
        <Image
          src="/rulo.png"
          alt="Solcito"
          width={icon}
          height={icon}
          className={cn(
            "object-contain",
            animated && "animate-pulse"
          )}
          style={{
            filter: "drop-shadow(0 0 8px rgba(6,182,212,0.6))",
          }}
        />
      </div>
      {showAmount && amount !== undefined && (
        <span
          className={cn(
            "font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent",
            text
          )}
        >
          {amount.toLocaleString()}
        </span>
      )}
    </div>
  );
}