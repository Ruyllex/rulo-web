import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export async function GET() {
  try {
    const self = await getSelf();

    if (!self) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({
      username: self.username,
      externalUserId: self.externalUserId,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}