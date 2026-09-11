'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'wifi-maupassant-clients';
const PLANS = [
  { id: '24h', label: '24h', duration: 24 * 60 * 60 * 1000 },
  { id: '7j', label: '7 Jours', duration: 7 * 24 * 60 * 60 * 1000 },
  { id: '30j', label: '30 Jours', duration: 30 * 24 * 60 * 60 * 1000 },
];

const initialForm = { name: '', phoneModel: '', macAddress: '', planId: '24h' };

function formatDate(value) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value));
}

function timeRemaining(expiresAt, now) {
  const remaining = new Date(expiresAt).getTime() - now;
  if (remaining <= 0) return 'EXPIRÉ ❌';
  const seconds = Math.floor(remaining / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${days ? `${days}j ` : ''}${hours}h ${minutes}m ${secs}s restantes`;
}

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [clients, setClients] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');

  // Hydrate la liste uniquement dans le navigateur, localStorage n'existant pas sur le serveur.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) setClients(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients, ready]);

  // Le compteur se rafraîchit toutes les secondes, y compris lorsque le formulaire est ouvert.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Détecte les expirations en direct et celles survenues tableau fermé.
  // notified évite les doublons après un rechargement ou lors des ticks suivants.
  useEffect(() => {
    if (!ready) return;
    const expired = clients.filter((client) => {
      const retryDelay = 60 * 1000;
      const mayRetry = !client.lastNotificationAttempt || now - client.lastNotificationAttempt >= retryDelay;
      return now >= new Date(client.expiresAt).getTime() && !client.notified && mayRetry;
    });
    if (!expired.length) return;

    // Marquer avant l'appel protège contre plusieurs déclenchements simultanés du timer.
    setClients((current) => current.map((client) => (
      expired.some((item) => item.id === client.id)
        ? { ...client, notified: true, lastNotificationAttempt: now }
        : client
    )));

    expired.forEach(async (client) => {
      try {
        const response = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(client),
        });
        if (!response.ok) throw new Error('Erreur API');
      } catch {
        // Réautorise un essai automatique après une minute (évite de marteler Discord).
        setClients((current) => current.map((item) => (
          item.id === client.id ? { ...item, notified: false } : item
        )));
        setNotice(`Alerte Discord non envoyée pour ${client.name}. Nouvelle tentative automatique...`);
      }
    });
  }, [now, clients, ready]);

  const activeCount = useMemo(
    () => clients.filter((client) => now < new Date(client.expiresAt).getTime()).length,
    [clients, now],
  );

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const plan = PLANS.find((item) => item.id === form.planId);
    const activatedAt = Date.now();
    setClients((current) => [
      {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        phoneModel: form.phoneModel.trim(),
        macAddress: form.macAddress.trim(),
        planLabel: plan.label,
        activatedAt: new Date(activatedAt).toISOString(),
        expiresAt: new Date(activatedAt + plan.duration).toISOString(),
        notified: false,
      },
      ...current,
    ]);
    setForm(initialForm);
    setNotice('Client activé et enregistré.');
  }

  function removeClient(id) {
    setClients((current) => current.filter((client) => client.id !== id));
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 rounded-2xl border border-cyan-500/20 bg-slate-900 p-5 shadow-2xl shadow-cyan-950/20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Zone Wi-Fi • Administration</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">WIFI MAUPASSANT - Admin </h1>
          <p className="mt-2 text-sm text-slate-400">{activeCount} accès actif{activeCount !== 1 ? 's' : ''} sur le réseau.</p>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-bold text-white">Activer un accès</h2>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-300">Nom du client
              <input required value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Ex. Christophe OGOUBIYI" className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-cyan-400" />
            </label>
            <label className="text-sm font-medium text-slate-300">Modèle de téléphone
              <input required value={form.phoneModel} onChange={(e) => updateForm('phoneModel', e.target.value)} placeholder="Ex. Samsung A12" className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-cyan-400" />
            </label>
            <label className="text-sm font-medium text-slate-300 sm:col-span-2">Adresse MAC / IP <span className="font-normal text-slate-500">(optionnel)</span>
              <input value={form.macAddress} onChange={(e) => updateForm('macAddress', e.target.value)} placeholder="Ex. AA:BB:CC:DD:EE:FF ou 192.168.1.20" className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-cyan-400" />
            </label>
            <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-slate-300">Forfait</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PLANS.map((plan) => <button type="button" key={plan.id} onClick={() => updateForm('planId', plan.id)} className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${form.planId === plan.id ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>{plan.label}</button>)}
              </div>
            </fieldset>
            <button type="submit" className="rounded-xl bg-cyan-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-300 sm:col-span-2">Activer &amp; Enregistrer le client</button>
          </form>
          {notice && <p className="mt-3 text-sm text-cyan-300" role="status">{notice}</p>}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">Clients enregistrés</h2>
          {!ready ? <p className="text-slate-400">Chargement…</p> : clients.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-500">Aucun client enregistré pour le moment.</div> : (
            <div className="grid gap-3">
              {clients.map((client) => {
                const expired = now >= new Date(client.expiresAt).getTime();
                return <article key={client.id} className={`rounded-2xl border p-4 ${expired ? 'border-red-500/50 bg-red-950/20' : 'border-slate-800 bg-slate-900'}`}>
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-white">{client.name}</h3><p className="text-sm text-slate-400">{client.phoneModel} · {client.macAddress || 'MAC/IP non spécifiée'}</p></div><button onClick={() => removeClient(client.id)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-red-500 hover:text-red-300">Retirer</button></div>
                  <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3"><p className="text-slate-400">Activé : <span className="text-slate-200">{formatDate(client.activatedAt)}</span></p><p className="text-slate-400">Fin : <span className="text-slate-200">{formatDate(client.expiresAt)}</span></p><p className={`font-bold ${expired ? 'text-red-400' : 'text-emerald-400'}`}>{timeRemaining(client.expiresAt, now)}</p></div>
                </article>;
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
