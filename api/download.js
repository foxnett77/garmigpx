const { GarminConnect } = require('garmin-connect');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send({ error: 'Method not allowed' });

  try {
    const { username, password, activityId } = req.body;
    if (!username || !password || !activityId) return res.status(400).send({ error: 'Dati mancanti' });

    const client = new GarminConnect({ username, password });
    await client.login();
    
    const gpxData = await client.downloadActivity(activityId, 'gpx');
    
    const buffer = Buffer.isBuffer(gpxData) ? gpxData : Buffer.from(gpxData);

    res.setHeader('Content-Type', 'application/gpx+xml');
    res.setHeader('Content-Disposition', `attachment; filename="activity_${activityId}.gpx"`);
    res.status(200).send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Errore di download' });
  }
}
