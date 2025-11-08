import { NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { getModerationLogs } from "@/lib/admin-service";

export async function GET() {
  try {
    const self = await getSelf();
    
    if (self.role !== 'ADMIN' && self.role !== 'SUPER_ADMIN' && self.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const logs = await getModerationLogs(1, 20);
    
    // Formatear para el dashboard
    const activities = logs.logs.map(log => ({
      action: `${log.moderator.username} ${getActionText(log.action)} ${log.user.username}`,
      details: log.reason,
      createdAt: log.createdAt,
    }));
    
    return NextResponse.json({ activities });
  } catch (error) {
    console.error('[ADMIN_ACTIVITY]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}

function getActionText(action: string): string {
  const actions: Record<string, string> = {
    BAN: 'baneó a',
    UNBAN: 'desbaneó a',
    TIMEOUT: 'suspendió a',
    WARNING: 'advirtió a',
    ROLE_CHANGE: 'cambió el role de',
    DELETE_MESSAGE: 'eliminó un mensaje de',
    AD_APPROVE: 'aprobó un anuncio de',
    AD_REJECT: 'rechazó un anuncio de',
    SPONSOR_APPROVE: 'aprobó un sponsor de',
    SPONSOR_REJECT: 'rechazó un sponsor de',
  };
  
  return actions[action] || 'realizó una acción sobre';
}