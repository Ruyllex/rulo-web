import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export function Logo() {
  return (
    <Link href="/">
      <div className="flex items-center gap-x-4 hover:opacity-75 transition">
        <div className="rounded-full p-1 mr-12 shrink-0 lg:mr-0 lg:shrink">
          <Image src="/rulo.png" alt="GameHub" height="62" width="62" />
        </div>
        <div className={cn(font.className, "hidden lg:block")}>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">Rulo</p>
            <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md shadow-cyan-500/40">
              BETA
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Comienza ahora!!</p>
        </div>
      </div>
    </Link>
  );
}