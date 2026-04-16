import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
// @ts-ignore
import { GarminConnect } from 'garmin-connect';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username e password richiesti' }, { status: 400 });
    }

    const client = new GarminConnect();
    await client.login(username, password);
    
    // Fetch last 15 activities
    const activities = await client.getActivities(0, 15);
    
    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error('Garmin activities error:', error);
    return NextResponse.json({ error: error.message || 'Errore di autenticazione o limite raggiunto' }, { status: 500 });
  }
}
