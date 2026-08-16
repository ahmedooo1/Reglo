<script setup lang="ts">
const lifecycle = [
  { status: 'Brouillon', color: 'muted', title: 'Tu crées le devis', text: 'Lignes, TVA multi-taux, totaux calculés automatiquement.' },
  { status: 'Envoyé', color: 'amber', title: 'Ton client le reçoit', text: 'Un lien public, sans compte à créer de son côté.' },
  { status: 'Accepté', color: 'indigo', title: 'Il accepte en ligne', text: 'Signature électronique du devis, converti en facture en un clic.' },
  { status: 'Payé', color: 'emerald', title: 'Tu encaisses', text: 'Paiement Stripe intégré à la facture, retards détectés automatiquement.' },
]

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
    <section class="mx-auto grid max-w-6xl gap-16 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:pt-24">
      <div class="min-w-0" v-reveal>
        <div class="mb-6 flex items-center gap-3">
          <span class="seal flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-indigo/50 text-center font-mono text-[9px] font-bold uppercase leading-tight text-indigo">
            100%<br />Conforme
          </span>
          <span class="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Devis &amp; factures<br />pour artisans &amp; indépendants
          </span>
        </div>
        <h1 class="font-display text-5xl font-bold leading-[1.05] text-ink md:text-6xl">
          Des devis et factures qui se font <span class="text-indigo underline decoration-solid decoration-4 underline-offset-8 decoration-indigo/30">payer</span>
        </h1>
        <p class="mt-6 font-body text-lg leading-relaxed text-muted">
          Crée un devis en 2 minutes, envoie-le par lien, convertis-le en facture et encaisse en ligne. Sans tableur, sans oubli de TVA.
        </p>
        <div class="mt-8 flex flex-col gap-4 sm:flex-row">
          <NuxtLink to="/register" class="rounded-lg bg-indigo px-7 py-3.5 text-center font-display font-semibold text-white shadow-sm transition hover:bg-indigo-dark">
            Essayer gratuitement
          </NuxtLink>
          <NuxtLink to="/login" class="rounded-lg border border-line px-7 py-3.5 text-center font-body font-medium text-ink transition hover:bg-white">
            Se connecter
          </NuxtLink>
        </div>
        <div class="mt-10 flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <span>Gratuit pour commencer</span>
          <span class="h-1 w-1 rounded-full bg-line" />
          <span>Sans carte bancaire</span>
        </div>
      </div>

      <div v-reveal="120">
        <InvoiceMockup />
      </div>
    </section>

    <!-- CYCLE DE VIE -->
    <section class="mx-auto max-w-6xl px-6 py-20">
      <h2 class="mb-4 font-display text-3xl font-bold text-ink md:text-4xl" v-reveal>Du devis à l'encaissement</h2>
      <p class="mb-14 max-w-lg font-body text-muted" v-reveal="60">
        Le même document suit tout son cycle de vie, sans ressaisie.
      </p>

      <div class="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(step, i) in lifecycle" :key="step.status" v-reveal="i * 90" class="relative">
          <div class="flex items-center gap-3">
            <span
              class="rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide"
              :class="{
                'bg-line text-muted': step.color === 'muted',
                'bg-amber-light text-amber': step.color === 'amber',
                'bg-indigo-light text-indigo': step.color === 'indigo',
                'bg-emerald-light text-emerald': step.color === 'emerald',
              }"
            >
              {{ step.status }}
            </span>
            <span v-if="i < lifecycle.length - 1" class="stepper-line hidden flex-1 lg:block" />
          </div>
          <h3 class="mt-3 font-display text-lg font-bold text-ink">{{ step.title }}</h3>
          <p class="mt-1.5 font-body text-sm leading-relaxed text-muted">{{ step.text }}</p>
        </div>
      </div>
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
                <option :value="20">20 % &mdash; taux normal</option>
                <option :value="10">10 % &mdash; taux intermédiaire</option>
                <option :value="5.5">5,5 % &mdash; taux réduit</option>
                <option :value="2.1">2,1 % &mdash; taux particulier</option>
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
