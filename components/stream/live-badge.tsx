import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

export function LiveBadge({ isLive }: { isLive: boolean }) {
  return isLive ? (
    <Badge className="bg-rose-600 text-white gap-1 animate-pulse">
      <Circle className="h-3 w-3 fill-current" />
      En vivo
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1">
      <Circle className="h-3 w-3" />
      Offline
    </Badge>
  );
}
