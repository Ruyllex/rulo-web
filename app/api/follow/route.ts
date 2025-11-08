// app/api/follow/route.ts
import { NextResponse } from "next/server";
import { followUser, unfollowUser } from "@/lib/follow-service";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new NextResponse("User ID requerido", { status: 400 });
    }

    await followUser(userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[FOLLOW_POST]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new NextResponse("User ID requerido", { status: 400 });
    }

    await unfollowUser(userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[FOLLOW_DELETE]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}