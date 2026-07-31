<script setup lang="ts">
const steps = [
  { n: '01', title: 'Cree ton devis', text: 'Ajoute tes lignes, la TVA et les totaux se calculent tout seuls.' },
  { n: '02', title: 'Envoie-le en un lien', text: 'Ton client le consulte, l accepte et signe en ligne, sans compte a creer.' },
  { n: '03', title: 'Facture et encaisse', text: 'Convertis le devis accepte en facture et propose le paiement en ligne.' },
]
</script>

<template>
  <main>
    <section class="mx-auto grid max-w-6xl gap-16 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:pt-24">
      <div>
        <span class="mb-5 inline-block rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted">
          Pour artisans &amp; independants
        </span>
        <h1 class="font-display text-5xl font-bold leading-[1.05] text-ink md:text-6xl">
          Des devis et factures qui se font <span class="text-indigo">payer</span>
        </h1>
        <p class="mt-6 font-body text-lg leading-relaxed text-muted">
          Cree un devis en 2 minutes, envoie-le par lien, convertis-le en facture et encaisse en ligne. Sans tableur, sans oubli de TVA.
        </p>
        <div class="mt-8 flex flex-col gap-4 sm:flex-row">
          <NuxtLink to="/register" class="rounded-lg bg-indigo px-7 py-3.5 text-center font-display font-semibold text-white shadow-sm transition hover:bg-indigo-dark">
            Essayer gratuitement
          </NuxtLink>
          <NuxtLink to="/login" class="rounded-lg border border-line px-7 py-3.5 text-center font-body font-medium text-ink transition hover:bg-white">
            Se connecter
          </NuxtLink>
        </div>
      </div>

      <InvoiceMockup />
    </section>

    <section class="mx-auto max-w-6xl px-6 py-20">
      <h2 class="mb-12 font-display text-3xl font-bold text-ink md:text-4xl">Du devis a l'encaissement</h2>
      <div class="grid gap-10 md:grid-cols-3">
        <div v-for="step in steps" :key="step.n">
          <span class="font-mono text-sm font-semibold text-indigo">{{ step.n }}</span>
          <h3 class="mt-2 font-display text-xl font-bold text-ink">{{ step.title }}</h3>
          <p class="mt-2 font-body text-sm leading-relaxed text-muted">{{ step.text }}</p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-4xl px-6 py-20 text-center">
      <h2 class="font-display text-3xl font-bold text-ink md:text-4xl">Pret a arreter les tableurs ?</h2>
      <p class="mx-auto mt-4 max-w-md font-body text-muted">
        Gratuit pour commencer. Pas de carte bancaire requise.
      </p>
      <NuxtLink to="/register" class="mt-8 inline-block rounded-lg bg-indigo px-8 py-4 font-display font-semibold text-white shadow-sm transition hover:bg-indigo-dark">
        Creer mon compte
      </NuxtLink>
    </section>
  </main>
</template>
