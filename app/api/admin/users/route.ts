import { NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { getAllUsers } from "@/lib/admin-service";

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await getAllUsers(page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[ADMIN_USERS]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}