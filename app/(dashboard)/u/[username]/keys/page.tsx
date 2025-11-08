// app/(dashboard)/u/[username]/keys/page.tsx
import { getSelf } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { KeysClient } from "./keys-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function StreamKeysPage({
  params,
}: {
  params: { username: string };
}) {
  const self = await getSelf();

  if (!self || self.username !== params.username) {
    redirect("/");
  }

  if (!self.isStreamer) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Necesitas ser streamer para acceder a esta página. 
            Ve a tu studio y activa el modo streamer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Verificar si ya tiene credenciales
  const hasCredentials = self.serverUrl && self.streamKey;

  return (
    <KeysClient
      username={self.username}
      initialServerUrl={self.serverUrl || ""}
      initialStreamKey={self.streamKey || ""}
      hasCredentials={hasCredentials}
    />
  );
}