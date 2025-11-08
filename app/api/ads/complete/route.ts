import { NextResponse } from "next/server";
import { recordAdCompletion } from "@/lib/ad-service";

export async function POST(req: Request) {
  try {
    const { impressionId, adId } = await req.json();
    
    if (!impressionId || !adId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await recordAdCompletion(impressionId, adId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADS_COMPLETE]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}