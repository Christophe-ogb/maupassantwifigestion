# 📶 MAUPASSANT WIFI — Admin Manager

Dashboard d'administration interne et autonome pour la gestion des accès Wi-Fi Zone (**WIFI MAUPASSANT**). 

L'application permet d'enregistrer les clients, d'attribuer des forfaits (1h, 24h, 7j, 30j), de calculer automatiquement l'heure exacte d'expiration et d'envoyer une alerte automatique 24/7 sur un salon **Discord** dès qu'un accès prend fin.

---

## 🚀 Fonctionnalités principales

- **Interface Mobile-First :** Dashboard moderne et sombre développé avec Next.js (App Router) et Tailwind CSS.
- **Saisie simplifiée :** Ajout rapide du client, du modèle d'appareil et de l'adresse MAC/IP.
- **Calcul 100% Automatique :** Génération instantanée de la date de fin selon le forfait souscrit.
- **Base de données Cloud :** Persistance des données et synchronisation via **Supabase (PostgreSQL)**.
- **Alertes Discord 24/7 :** Webhooks configurés pour envoyer une notification rouge 🚨 avec action requise (suppression sur le routeur/box).
- **Exécution Autonome :** Planification en arrière-plan via **Vercel Cron Jobs** (tourne toutes les 5 minutes, même PC/Téléphone éteint).

---

## 🛠️ Tech Stack

- **Frontend / Backend :** Next.js 14+ (App Router, Route Handlers)
- **Styling :** Tailwind CSS
- **Database :** Supabase (PostgreSQL)
- **Notifications :** Discord Webhook API
- **Hébergement & Cron :** Vercel & Vercel Cron Jobs

---

## ⚙️ Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec les clés suivantes :

```env
DISCORD_WEBHOOK_URL=[https://discord.com/api/webhooks/](https://discord.com/api/webhooks/)...
NEXT_PUBLIC_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
CRON_SECRET=your-cron-secret-key