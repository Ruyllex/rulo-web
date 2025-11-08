import { NextResponse } from "next/server";
import { recordSponsorClick } from "@/lib/sponsor-service";

export async function POST(req: Request) {
  try {
    const { sponsorId } = await req.json();
    
    if (!sponsorId) {
      return NextResponse.json(
        { error: 'Sponsor ID required' },
        { status: 400 }
      );
    }

    await recordSponsorClick(sponsorId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SPONSORS_CLICK]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}