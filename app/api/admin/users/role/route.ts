import { NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { updateUserRole } from "@/lib/admin-service";

export async function POST(req: Request) {
  try {
    const self = await getSelf();
    
    // Solo ADMIN y SUPER_ADMIN pueden cambiar roles
    if (self.role !== 'ADMIN' && self.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { userId, role, reason } = await req.json();

    if (!userId || !role || !reason) {
      return NextResponse.json(
        { error: 'User ID, role, and reason required' },
        { status: 400 }
      );
    }

    const user = await updateUserRole(userId, role, self.id, reason);
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('[ADMIN_ROLE]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}