"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Settings, Users, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { EmojiButton, GiftSolcitosButton, BuySolcitosButton, SubscribeButton } from "@/components/chat/chat-actions"; // ✅ AGREGAR SubscribeButton
import { SolcitoIcon } from "@/components/solcito-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  username: string;
  userImage: string;
  message: string;
  createdAt: Date;
  isPrime?: boolean;
  isStreamer?: boolean;
  isModerator?: boolean;
  solcitos?: number;
  userId: string;
}

interface ChatSettings {
  isChatEnabled: boolean;
  isChatFollowersOnly: boolean;
  isChatSubscribersOnly: boolean;
  slowModeSeconds: number;
}

interface LiveChatProps {
  streamId: string;
  streamerId: string;
  streamerName: string;
  isFollowing: boolean;
  isPrime?: boolean;
  isOwner?: boolean;
  viewerCount?: number;
  currentUserId?: string;
  userBalance?: number;
}

export function LiveChat({
  streamId,
  streamerId,
  streamerName,
  isFollowing,
  isPrime = false,
  isOwner = false,
  viewerCount = 0,
  currentUserId,
  userBalance = 0,
}: LiveChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<ChatSettings>({
    isChatEnabled: true,
    isChatFollowersOnly: false,
    isChatSubscribersOnly: false,
    slowModeSeconds: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes iniciales
  useEffect(() => {
    loadMessages();
    
    // Polling cada 2 segundos
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [streamId]);

  // Auto-scroll al final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${streamId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        })));
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    if (!isFollowing && settings.isChatFollowersOnly && !isOwner) {
      toast.error("Debes seguir al canal para chatear");
      return;
    }

    if (!isPrime && settings.isChatSubscribersOnly && !isOwner) {
      toast.error("Solo los suscriptores pueden chatear");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/chat/${streamId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setMessage("");
      loadMessages();
    } catch (error: any) {
      toast.error(error.message || "No se pudo enviar el mensaje");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/chat/message/${messageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadMessages();
        toast.success("Mensaje eliminado");
      }
    } catch (error) {
      toast.error("No se pudo eliminar el mensaje");
    }
  };

  const toggleChat = async () => {
    try {
      const res = await fetch(`/api/chat/${streamId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isChatEnabled: !settings.isChatEnabled,
        }),
      });

      if (res.ok) {
        const newSettings = await res.json();
        setSettings(newSettings);
        toast.success(newSettings.isChatEnabled ? "Chat activado" : "Chat desactivado");
      }
    } catch (error) {
      toast.error("No se pudo cambiar la configuración");
    }
  };

  const toggleFollowersOnly = async () => {
    try {
      const res = await fetch(`/api/chat/${streamId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isChatFollowersOnly: !settings.isChatFollowersOnly,
        }),
      });

      if (res.ok) {
        const newSettings = await res.json();
        setSettings(newSettings);
        toast.success(
          newSettings.isChatFollowersOnly
            ? "Modo solo seguidores activado"
            : "Modo solo seguidores desactivado"
        );
        setShowSettings(false);
      }
    } catch (error) {
      toast.error("No se pudo cambiar la configuración");
    }
  };

  const clearChat = async () => {
    try {
      const res = await fetch(`/api/chat/${streamId}/clear`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadMessages();
        toast.success("Chat limpiado");
        setShowSettings(false);
      }
    } catch (error) {
      toast.error("No se pudo limpiar el chat");
    }
  };

  const canChat = settings.isChatEnabled && 
                  (isOwner || 
                   (isFollowing && !settings.isChatFollowersOnly) ||
                   (isFollowing && !settings.isChatSubscribersOnly) ||
                   (isPrime && settings.isChatSubscribersOnly));

  // ✅ DEBUG: Ver valores
  console.log('LiveChat Debug:', {
    isOwner,
    isPrime,
    streamerId,
    streamerName,
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header del Chat */}
      <div className="flex items-center justify-between p-3 border-b border-cyan-500/20 bg-cyan-500/5">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-cyan-600 dark:text-cyan-400">
            Chat en vivo
          </h3>
          {!settings.isChatEnabled && (
            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-500 rounded">
              Desactivado
            </span>
          )}
          {settings.isChatFollowersOnly && (
            <Shield className="h-4 w-4 text-cyan-500" />
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{viewerCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Botones de acción en el header */}
        {isOwner ? (
          // Menú de configuración - Solo para owner
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-cyan-500/10 rounded transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Menú Simple de Configuración */}
            {showSettings && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 bg-background border border-cyan-500/20 rounded-lg shadow-lg w-56 overflow-hidden">
                  <button
                    onClick={toggleChat}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-cyan-500/10 transition-colors"
                  >
                    {settings.isChatEnabled ? "Desactivar chat" : "Activar chat"}
                  </button>
                  <button
                    onClick={toggleFollowersOnly}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-cyan-500/10 transition-colors"
                  >
                    {settings.isChatFollowersOnly
                      ? "Permitir todos"
                      : "Solo seguidores"}
                  </button>
                  <div className="border-t border-cyan-500/20" />
                  <button
                    onClick={clearChat}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-500/10 text-red-500 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpiar chat
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          // Botón de suscribirse - Solo para espectadores
          <SubscribeButton
            streamerId={streamerId}
            streamerName={streamerName}
            isSubscribed={isPrime}
            isPrime={isPrime}
          />
        )}
      </div>

      {/* Área de Mensajes */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="text-muted-foreground text-sm">
                ¡Sé el primero en enviar un mensaje!
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onDelete={isOwner ? handleDeleteMessage : undefined}
                canDelete={isOwner || msg.userId === currentUserId}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input del Chat */}
      <div className="p-3 border-t border-cyan-500/20 space-y-2">
        {!settings.isChatEnabled && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-500 text-center font-medium">
              El chat está desactivado
            </p>
          </div>
        )}
        
        {settings.isChatEnabled && !canChat && (
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-xs text-cyan-500 text-center font-medium">
              {settings.isChatFollowersOnly
                ? `Debes seguir a ${streamerName} para chatear`
                : `Solo suscriptores pueden chatear`}
            </p>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-1">
              <EmojiButton />
              <GiftSolcitosButton
                streamerId={streamerId}
                streamerName={streamerName}
                userBalance={userBalance}
              />
              <BuySolcitosButton variant="icon" />
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={canChat ? "Enviar un mensaje" : "Chat desactivado"}
                disabled={!canChat || isLoading}
                maxLength={500}
                className={cn(
                  "bg-background border-cyan-500/20",
                  "focus-visible:ring-cyan-500/50",
                  (!canChat || isLoading) && "opacity-50 cursor-not-allowed"
                )}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!message.trim() || !canChat || isLoading}
                className={cn(
                  "shrink-0",
                  "bg-gradient-to-r from-cyan-600 to-cyan-700",
                  "hover:from-cyan-500 hover:to-cyan-600",
                  "shadow-lg shadow-cyan-500/30",
                  "disabled:opacity-50 disabled:shadow-none"
                )}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessageItem({
  message,
  onDelete,
  canDelete,
}: {
  message: ChatMessage;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}) {
  return (
    <div className="group hover:bg-cyan-500/5 -mx-2 px-2 py-1.5 rounded transition-colors relative">
      <div className="flex items-start gap-2">
        <Avatar className="h-6 w-6 mt-0.5">
          <AvatarImage src={message.userImage} />
          <AvatarFallback className="text-xs bg-cyan-600 text-white">
            {message.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Badges */}
            {message.isStreamer && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded">
                STREAMER
              </span>
            )}
            {message.isModerator && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded">
                MOD
              </span>
            )}
            {message.isPrime && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded">
                PRIME
              </span>
            )}

            {/* Username */}
            <span
              className={cn(
                "font-semibold text-sm",
                message.isStreamer && "text-red-500",
                message.isModerator && "text-green-500",
                message.isPrime && "text-purple-400"
              )}
            >
              {message.username}
            </span>

            {/* Solcitos */}
            {message.solcitos && (
              <SolcitoIcon size="xs" amount={message.solcitos} />
            )}

            {/* Timestamp */}
            <span className="text-xs text-muted-foreground">
              {message.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Message */}
          <p className="text-sm text-foreground break-words mt-0.5">
            {message.message}
          </p>
        </div>

        {/* Delete button */}
        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(message.id)}
            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 rounded"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
}