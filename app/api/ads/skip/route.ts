import { NextResponse } from "next/server";
import { recordAdSkip } from "@/lib/ad-service";

export async function POST(req: Request) {
  try {
    const { impressionId, adId, watchTime } = await req.json();
    
    if (!impressionId || !adId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await recordAdSkip(impressionId, adId, watchTime || 0);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADS_SKIP]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}