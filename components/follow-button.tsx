// components/follow-button.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

export function FollowButton({ userId, isFollowing: initialIsFollowing }: FollowButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const handleFollow = async () => {
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error);
      }

      setIsFollowing(true);
      toast.success("Ahora sigues a este usuario");
      
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      toast.error(error.message || "Error al seguir");
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch("/api/follow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error);
      }

      setIsFollowing(false);
      toast.success("Dejaste de seguir a este usuario");
      
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      toast.error(error.message || "Error al dejar de seguir");
    }
  };

  return (
    <>
      {isFollowing ? (
        <Button
          onClick={handleUnfollow}
          disabled={isPending}
          variant="outline"
          size="sm"
        >
          <UserMinus className="h-4 w-4 mr-2" />
          Siguiendo
        </Button>
      ) : (
        <Button
          onClick={handleFollow}
          disabled={isPending}
          size="sm"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Seguir
        </Button>
      )}
    </>
  );
}