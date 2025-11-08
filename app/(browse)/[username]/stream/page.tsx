// app/(dashboard)/u/[username]/stream/page.tsx
import { getSelf } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BrowserBroadcast } from "@/components/stream-player/browser-broadcast";

export default async function StreamPage({
  params,
}: {
  params: { username: string };
}) {
  const self = await getSelf();

  if (!self || self.username !== params.username) {
    redirect("/");
  }

  if (!self.isStreamer) {
    redirect(`/u/${params.username}/studio`);
  }

  const stream = await db.stream.findUnique({
    where: { userId: self.id },
  });

  if (!stream) {
    redirect(`/u/${params.username}/studio`);
  }

  async function toggleStream() {
    "use server";
    
    await db.stream.update({
      where: { userId: self.id },
      data: {
        isLive: !stream?.isLive,
      },
    });
    
    redirect(`/u/${params.username}/stream`);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mi Stream</h1>
      
      <BrowserBroadcast
        isHost={true}
        isLive={stream.isLive}
        username={self.username}
        onToggleStream={async () => {
          "use server";
          await toggleStream();
        }}
      />
      
      {stream.isLive && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 rounded">
          <p className="text-sm">
            Los viewers pueden verte en:{" "}
            <a href={`/${self.username}`} target="_blank" className="underline">
              /{self.username}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}