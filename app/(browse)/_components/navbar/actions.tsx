// components/navbar/actions.tsx
import { currentUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSelf, needsUsernameSetup } from "@/lib/auth-service";
import { Clapperboard, Settings } from "lucide-react";

export async function Actions() {
  const user = await currentUser();
  
  if (!user) {
    return (
      <SignInButton mode="modal">
        <Button size="sm" variant="ghost">
          Login
        </Button>
      </SignInButton>
    );
  }

  const dbUser = await getSelf();

  // Si tiene username temporal, mostrar botón para configurarlo
  if (needsUsernameSetup(dbUser.username)) {
    return (
      <div className="flex items-center gap-x-2 ml-4 lg:ml-0">
        <Link href="/setup-username">
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Username
          </Button>
        </Link>
        <UserButton afterSignOutUrl="/" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-2 ml-4 lg:ml-0">
      <Link href={`/u/${dbUser.username}/studio`}>
        <Button 
          size="sm" 
          className="text-muted-foreground hover:text-primary"
          variant={dbUser.isStreamer ? "default" : "secondary"}
        >
          <Clapperboard className="h-5 w-5 lg:mr-2" />
          <span className="hidden lg:block">
            {dbUser.isStreamer ? "Dashboard" : "Ser Streamer"}
          </span>
        </Button>
      </Link>
      
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}