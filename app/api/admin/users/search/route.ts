import { NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { searchUsers } from "@/lib/admin-service";

export async function GET(req: Request) {
  try {
    const self = await getSelf();
    
    if (self.role !== 'ADMIN' && self.role !== 'SUPER_ADMIN' && self.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const users = await searchUsers(query);
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('[ADMIN_USERS_SEARCH]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}