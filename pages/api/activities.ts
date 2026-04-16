import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import { GarminConnect } from 'garmin-connect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'API is working' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password richiesti' });
    }

    const client = new GarminConnect({ username, password });
    await client.login();
    
    // Fetch last 15 activities
    const activities = await client.getActivities(0, 15);
    
    res.status(200).json({ activities });
  } catch (error: any) {
    console.error('Garmin activities error:', error);
    res.status(500).json({ error: error.message || 'Errore di autenticazione o limite raggiunto' });
  }
}
