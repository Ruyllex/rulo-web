// app/api/setup-user/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { username } = await req.json();

    if (!username || username.length < 3) {
      return NextResponse.json({ message: "Username muy corto" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ message: "Username ya existe" }, { status: 400 });
    }

    await db.user.upsert({
      where: { externalUserId: user.id },
      update: { username, imageUrl: user.imageUrl || "https://github.com/shadcn.png" },
      create: { externalUserId: user.id, username, imageUrl: user.imageUrl || "https://github.com/shadcn.png" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}