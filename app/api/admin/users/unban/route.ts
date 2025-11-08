import { NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { unbanUser } from "@/lib/admin-service";

export async function POST(req: Request) {
  try {
    const self = await getSelf();
    
    if (self.role !== 'ADMIN' && self.role !== 'SUPER_ADMIN' && self.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { userId, reason } = await req.json();

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'User ID and reason required' },
        { status: 400 }
      );
    }

    const user = await unbanUser(userId, self.id, reason);
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('[ADMIN_UNBAN]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}