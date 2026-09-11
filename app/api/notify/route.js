import { NextResponse } from 'next/server';
import { sendExpirationNotification } from '../../../lib/discord';

export const runtime = 'nodejs';

/** Reçoit les données d'un client expiré et déclenche l'embed Discord. */
export async function POST(request) {
  try {
    const client = await request.json();
    const requiredFields = ['name', 'phoneModel', 'planLabel', 'expiresAt'];

    if (requiredFields.some((field) => !client[field])) {
      return NextResponse.json({ error: 'Données client incomplètes.' }, { status: 400 });
    }

    if (Number.isNaN(new Date(client.expiresAt).getTime())) {
      return NextResponse.json({ error: 'Date d’expiration invalide.' }, { status: 400 });
    }

    await sendExpirationNotification(client);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur notification Discord :', error);
    return NextResponse.json(
      { error: 'Impossible d’envoyer la notification Discord.' },
      { status: 500 },
    );
  }
}
