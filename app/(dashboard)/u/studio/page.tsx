import { redirect } from "next/navigation";
import { getSelf } from "@/lib/auth-service";

export default async function StudioRedirect() {
  const self = await getSelf().catch(() => null);
  if (!self) redirect("/sign-in");
  if (!self.username) redirect("/onboarding");
  redirect(`/u/${self.username}/studio`);
}
