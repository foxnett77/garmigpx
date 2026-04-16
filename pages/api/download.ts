import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import { GarminConnect } from 'garmin-connect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, activityId } = req.body;

    if (!username || !password || !activityId) {
      return res.status(400).json({ error: 'Dati mancanti' });
    }

    const client = new GarminConnect();
    await client.login(username, password);
    
    const gpxData = await client.downloadActivity(activityId, 'gpx');
    const buffer = Buffer.isBuffer(gpxData) ? gpxData : Buffer.from(gpxData);

    res.setHeader('Content-Type', 'application/gpx+xml');
    res.setHeader('Content-Disposition', `attachment; filename="activity_${activityId}.gpx"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Garmin download error:', error);
    res.status(500).json({ error: error.message || 'Errore durante il download' });
  }
}
