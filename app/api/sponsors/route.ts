import { NextResponse } from "next/server";
import {
  getPlatformSponsors,
  getStreamerSponsors,
  getAllActiveSponsors,
} from "@/lib/sponsor-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const streamerId = searchParams.get('streamerId');
    const type = searchParams.get('type');

    let sponsors;

    if (streamerId) {
      // Obtener sponsors del streamer + platform sponsors
      const [streamerSponsors, platformSponsors] = await Promise.all([
        getStreamerSponsors(streamerId),
        getPlatformSponsors(),
      ]);
      sponsors = [...streamerSponsors, ...platformSponsors];
    } else if (type === 'platform') {
      sponsors = await getPlatformSponsors();
    } else {
      sponsors = await getAllActiveSponsors();
    }

    return NextResponse.json({ sponsors });
  } catch (error) {
    console.error('[SPONSORS_GET]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}