# WIFI MAUPASSANT — Admin Manager

Dashboard interne mobile pour enregistrer les accès Wi-Fi, suivre leur expiration et envoyer une alerte Discord lorsqu'un forfait expire.

## Lancer en local

```bash
npm install
```

Créez `.env.local` à partir de `.env.example`, puis renseignez votre URL de webhook Discord.

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Mettre en ligne sur Vercel

1. Créez un dépôt GitHub nommé `Maupassantwifigestion` et poussez ce dossier.
2. Dans Vercel, choisissez **Add New → Project**, puis importez ce dépôt.
3. Dans **Settings → Environment Variables**, ajoutez `DISCORD_WEBHOOK_URL` avec l'URL complète de votre webhook Discord. Sélectionnez les environnements Production, Preview et Development si nécessaire.
4. Lancez le déploiement. Vercel détecte automatiquement Next.js ; aucune configuration supplémentaire n'est nécessaire.

> Les clients sont enregistrés dans le `localStorage` du navigateur utilisé pour administrer le service. Les données ne sont donc pas partagées entre plusieurs téléphones ou ordinateurs et disparaissent si les données du navigateur sont effacées.

## Commandes utiles

```bash
npm run dev      # développement
npm run build    # vérification de production
npm run start    # exécuter le build localement
```
