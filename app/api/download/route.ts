import { NextResponse } from 'next/server';
// @ts-ignore
import { GarminConnect } from 'garmin-connect';

export async function POST(request: Request) {
  try {
    const { username, password, activityId } = await request.json();

    if (!username || !password || !activityId) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const client = new GarminConnect();
    await client.login(username, password);
    
    const gpxData = await client.downloadActivity(activityId, 'gpx');
    
    // Check if gpxData is already an arraybuffer or buffer
    const buffer = Buffer.isBuffer(gpxData) ? gpxData : Buffer.from(gpxData);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/gpx+xml',
        'Content-Disposition': `attachment; filename="activity_${activityId}.gpx"`,
      },
    });
  } catch (error: any) {
    console.error('Garmin download error:', error);
    return NextResponse.json({ error: error.message || 'Errore durante il download' }, { status: 500 });
  }
}
