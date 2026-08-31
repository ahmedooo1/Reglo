<script setup lang="ts">
const montantHT = ref(1200)
const tauxTVA = ref(20)
const montantTVA = computed(() => (montantHT.value * tauxTVA.value) / 100)
const montantTTC = computed(() => montantHT.value + montantTVA.value)

function euros(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const metiers = [
  { name: 'Artisan du bâtiment', text: 'Un devis par chantier, factures d’acompte et de solde.' },
  { name: 'Consultant indépendant', text: 'Factures mensuelles récurrentes, relances automatiques.' },
  { name: 'Développeur freelance', text: 'Devis détaillés par prestation, paiement en ligne rapide.' },
  { name: 'Photographe', text: 'Devis envoyé avant séance, facture après livraison.' },
  { name: 'Coach sportif', text: 'Forfaits et séances à l’unité, suivi des encaissements.' },
  { name: 'Architecte d’intérieur', text: 'Devis multi-postes avec TVA à taux réduits.' },
]
</script>

<template>
  <main class="overflow-x-clip">
    <!-- HERO -->
    <section class="mx-auto max-w-3xl px-6 pb-10 pt-16 md:pt-24">
      <div v-reveal>
        <h1 class="font-display text-5xl font-bold leading-[1.05] text-ink md:text-6xl">
          Des devis et factures qui se font payer
        </h1>
        <p class="mt-6 max-w-lg font-body text-lg leading-relaxed text-muted">
          Crée un devis en 2 minutes, envoie-le par lien, convertis-le en facture et encaisse en ligne. Sans tableur, sans oubli de TVA.
        </p>
        <div class="mt-8">
          <NuxtLink to="/register" class="inline-block rounded-lg bg-indigo px-7 py-3.5 text-center font-display font-semibold text-white shadow-sm transition hover:bg-indigo-dark">
            Essayer gratuitement
          </NuxtLink>
        </div>
        <p class="mt-9 flex items-center gap-2 font-mono text-xs text-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="animate-bounce"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
          Un seul document, tout son cycle de vie
        </p>
      </div>
    </section>

    <!-- CYCLE DE VIE : le document lui-meme change d'etat au fil du scroll -->
    <section class="mx-auto max-w-6xl px-6 py-10" v-reveal>
      <DocumentJourney />
    </section>

    <!-- CALCULATEUR TVA -->
    <section class="border-y border-line bg-white/60 py-20">
      <div class="mx-auto max-w-3xl px-6 text-center">
        <span class="font-mono text-xs uppercase tracking-[0.2em] text-indigo" v-reveal>Essaie tout de suite</span>
        <h2 class="mt-3 font-display text-3xl font-bold text-ink md:text-4xl" v-reveal="60">Le calcul de TVA, en direct</h2>

        <div class="mt-10 rounded-2xl border border-line bg-paper p-8 shadow-card" v-reveal="120">
          <div class="grid gap-6 sm:grid-cols-2">
            <label class="block text-left">
              <span class="font-body text-xs font-medium uppercase tracking-wide text-muted">Montant HT</span>
              <div class="mt-2 flex items-center rounded-lg border border-line bg-white px-4 py-3">
                <input
                  v-model.number="montantHT"
                  type="number"
                  min="0"
                  class="focus-ring w-full bg-transparent font-mono text-lg tabular text-ink outline-none"
                />
                <span class="font-mono text-muted">&euro;</span>
              </div>
            </label>
            <label class="block text-left">
              <span class="font-body text-xs font-medium uppercase tracking-wide text-muted">Taux de TVA</span>
              <select
                v-model.number="tauxTVA"
                class="focus-ring mt-2 w-full rounded-lg border border-line bg-white px-4 py-3 font-mono text-lg text-ink outline-none"
              >
                <option :value="20">20 %, taux normal</option>
                <option :value="10">10 %, taux intermédiaire</option>
                <option :value="5.5">5,5 %, taux réduit</option>
                <option :value="2.1">2,1 %, taux particulier</option>
              </select>
            </label>
          </div>

          <div class="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-3">
            <div>
              <p class="font-body text-xs uppercase tracking-wide text-muted">Montant HT</p>
              <p class="mt-1 font-mono text-xl tabular text-ink">{{ euros(montantHT) }} &euro;</p>
            </div>
            <div>
              <p class="font-body text-xs uppercase tracking-wide text-muted">TVA</p>
              <p class="mt-1 font-mono text-xl tabular text-ink">{{ euros(montantTVA) }} &euro;</p>
            </div>
            <div class="col-span-2 sm:col-span-1">
              <p class="font-body text-xs uppercase tracking-wide text-indigo">Total TTC</p>
              <p class="mt-1 font-mono text-xl font-bold tabular text-indigo">{{ euros(montantTTC) }} &euro;</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- POUR QUI -->
    <section class="ledger-lines mx-auto max-w-5xl px-6 py-24">
      <h2 class="mb-4 text-center font-display text-3xl font-bold text-ink md:text-4xl" v-reveal>Pensé pour chaque métier</h2>
      <p class="mx-auto mb-14 max-w-lg text-center font-body text-muted" v-reveal="60">
        La même rigueur de facturation, adaptée à ton activité.
      </p>

      <div class="divide-y divide-line rounded-2xl border border-line bg-white/70 shadow-card">
        <div
          v-for="(m, i) in metiers"
          :key="m.name"
          v-reveal="i * 50"
          class="flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="font-display font-semibold text-ink">{{ m.name }}</p>
          <p class="font-body text-sm text-muted sm:max-w-sm sm:text-right">{{ m.text }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mx-auto max-w-4xl px-6 pb-28">
      <div class="relative overflow-hidden rounded-2xl border-2 border-indigo/20 bg-white px-8 py-16 text-center shadow-card" v-reveal>
        <span class="seal absolute -right-6 -top-6 flex h-24 w-24 rotate-12 items-center justify-center rounded-full border-2 border-dashed border-emerald/40 text-center font-mono text-[9px] font-bold uppercase leading-tight text-emerald opacity-70">
          Prêt à<br />encaisser
        </span>
        <h2 class="font-display text-3xl font-bold text-ink md:text-4xl">Prêt à arrêter les tableurs ?</h2>
        <p class="mx-auto mt-4 max-w-md font-body text-muted">
          Gratuit pour commencer. Pas de carte bancaire requise.
        </p>
        <NuxtLink to="/register" class="mt-8 inline-block rounded-lg bg-indigo px-8 py-4 font-display font-semibold text-white shadow-sm transition hover:bg-indigo-dark">
          Créer mon compte
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
