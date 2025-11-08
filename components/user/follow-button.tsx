'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  username: string;
}

export function FollowButton({ userId, isFollowing: initialIsFollowing, username }: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    try {
      setIsLoading(true);

      if (isFollowing) {
        // Unfollow
        await axios.delete('/api/follow', {
          data: { userId },
        });
        setIsFollowing(false);
        toast.success(`Dejaste de seguir a ${username}`);
      } else {
        // Follow
        await axios.post('/api/follow', { userId });
        setIsFollowing(true);
        toast.success(`¡Ahora sigues a ${username}!`);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      toast.error(error.response?.data || 'Algo salió mal');
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || isPending;

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? 'outline' : 'default'}
      size="lg"
      className={cn(
        'gap-2 transition-all',
        !isFollowing && 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/30',
        isFollowing && 'hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500'
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          {isFollowing ? 'Dejando de seguir...' : 'Siguiendo...'}
        </>
      ) : isFollowing ? (
        <>
          <HeartOff className="h-5 w-5" />
          Siguiendo
        </>
      ) : (
        <>
          <Heart className="h-5 w-5" />
          Seguir
        </>
      )}
    </Button>
  );
}