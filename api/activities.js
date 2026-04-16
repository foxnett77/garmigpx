const { GarminConnect } = require('garmin-connect');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send({ error: 'Method not allowed' });
  
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send({ error: 'Credenziali mancanti' });

    const client = new GarminConnect({ username, password });
    await client.login();
    const activities = await client.getActivities(0, 15);
    
    res.status(200).json({ activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Errore Garmin' });
  }
}
