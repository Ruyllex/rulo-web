"use client";
import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";

export default function HostStudio({ roomName }: { roomName: string }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        body: JSON.stringify({ roomName, role: "host" }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setToken(data.token);
    })();
  }, [roomName]);

  if (!token) return <div className="p-4">Conectando al estudio…</div>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
      data-lk-theme="default"
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
