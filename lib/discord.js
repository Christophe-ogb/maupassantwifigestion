/**
 * Envoie l'alerte d'expiration au webhook Discord configuré côté serveur.
 * Cette fonction ne doit jamais être appelée depuis le navigateur : l'URL du
 * webhook reste ainsi protégée dans DISCORD_WEBHOOK_URL.
 */
export async function sendExpirationNotification(client) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl.includes('VOTRE_WEBHOOK')) {
    throw new Error('DISCORD_WEBHOOK_URL n’est pas configurée.');
  }

  const expiration = new Date(client.expiresAt).toISOString();
  const payload = {
    embeds: [
      {
        title: '🚨 FORFAIT EXPIRÉ - WIFI MAUPASSANT',
        color: 15158332,
        fields: [
          { name: '👤 Client', value: client.name, inline: true },
          { name: '📱 Appareil', value: client.phoneModel, inline: true },
          { name: '📍 Adresse MAC', value: client.macAddress || 'Non spécifiée' },
          { name: '⏱️ Forfait', value: client.planLabel, inline: true },
          {
            name: '👉 Action requise',
            value: 'Connecte-toi sur la box (192.168.1.1) et retire cet appareil / cette MAC.',
          },
        ],
        timestamp: expiration,
        footer: { text: 'WIFI MAUPASSANT • Gestion des accès' },
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Discord a répondu avec le statut ${response.status}.`);
  }
}
