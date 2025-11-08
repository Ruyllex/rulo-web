import { NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { getPlatformStats } from "@/lib/admin-service";

export async function GET() {
  try {
    const self = await getSelf();
    
    if (self.role !== 'ADMIN' && self.role !== 'SUPER_ADMIN' && self.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const stats = await getPlatformStats();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[ADMIN_STATS]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}