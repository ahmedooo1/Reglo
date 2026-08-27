<script setup lang="ts">
useHead({ title: 'Politique de confidentialité — Reglo' })
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-14">
    <h1 class="font-display text-3xl font-bold text-ink">Politique de confidentialité</h1>

    <nav class="mt-3 flex gap-4 font-body text-sm text-muted">
      <NuxtLink to="/legal/mentions-legales" class="hover:text-ink">Mentions légales</NuxtLink>
      <NuxtLink to="/legal/cgu" class="hover:text-ink">CGU / CGV</NuxtLink>
      <NuxtLink to="/legal/confidentialite" class="text-indigo underline">Confidentialité</NuxtLink>
    </nav>

    <p class="mt-6 rounded-lg border border-amber/40 bg-amber-light px-4 py-3 font-body text-sm text-ink">
      ⚠ Modèle à faire relire avant mise en exploitation commerciale.
    </p>

    <div class="mt-8 space-y-8 font-body text-sm leading-relaxed text-ink/80">
      <section>
        <h2 class="font-display text-lg font-semibold text-ink">Responsable de traitement</h2>
        <p class="mt-2">
          <strong>[NOM / RAISON SOCIALE À COMPLÉTER]</strong>, contact :
          <strong>aahmadooo997@gmail.com</strong>.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">Données collectées</h2>
        <p class="mt-2">
          Pour les Utilisateurs (comptes) : nom, email, mot de passe (stocké de façon chiffrée),
          informations d'entreprise facultatives (raison sociale, SIRET, TVA, adresse, IBAN) pour
          la génération des documents. Pour les clients de l'Utilisateur, saisis par ce dernier :
          nom, adresse, email, téléphone, SIRET. Données techniques : adresse IP et journaux de
          connexion à des fins de sécurité.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">Finalités et bases légales</h2>
        <p class="mt-2">
          Fourniture du service de création de devis et factures (exécution du contrat), paiement
          en ligne des factures via Stripe (exécution du contrat), sécurité et prévention des abus
          (intérêt légitime).
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">Durées de conservation</h2>
        <p class="mt-2">
          Données de compte : durée de vie du compte + 3 ans après la dernière activité. Devis et
          factures : conservés selon les durées de conservation comptables applicables à
          l'Utilisateur (en principe 10 ans pour les documents comptables). Journaux techniques :
          12 mois.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">Sous-traitants</h2>
        <p class="mt-2">
          Hébergement : OVH SAS (France). Paiement des factures en ligne : Stripe Payments Europe
          Ltd. Aucune donnée n'est vendue à des tiers.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">Vos droits</h2>
        <p class="mt-2">
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement,
          de portabilité et d'opposition. Exercez-les en écrivant à
          <strong>aahmadooo997@gmail.com</strong>. Vous pouvez introduire une réclamation auprès de
          la CNIL (cnil.fr).
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">Cookies</h2>
        <p class="mt-2">
          Le site utilise uniquement des cookies techniques nécessaires au fonctionnement
          (authentification). Aucun cookie publicitaire ou de suivi tiers n'est déposé.
        </p>
      </section>
    </div>
  </main>
</template>
