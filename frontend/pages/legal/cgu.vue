<script setup lang="ts">
useHead({ title: 'CGU / CGV — Reglo' })
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-14">
    <h1 class="font-display text-3xl font-bold text-ink">Conditions générales d'utilisation et de vente</h1>

    <nav class="mt-3 flex gap-4 font-body text-sm text-muted">
      <NuxtLink to="/legal/mentions-legales" class="hover:text-ink">Mentions légales</NuxtLink>
      <NuxtLink to="/legal/cgu" class="text-indigo underline">CGU / CGV</NuxtLink>
      <NuxtLink to="/legal/confidentialite" class="hover:text-ink">Confidentialité</NuxtLink>
    </nav>

    <p class="mt-6 rounded-lg border border-amber/40 bg-amber-light px-4 py-3 font-body text-sm text-ink">
      ⚠ Modèle à faire relire par un professionnel avant mise en exploitation commerciale.
    </p>

    <div class="mt-8 space-y-8 font-body text-sm leading-relaxed text-ink/80">
      <section>
        <h2 class="font-display text-lg font-semibold text-ink">1. Objet</h2>
        <p class="mt-2">
          Reglo est un outil en ligne de création de devis et de factures destiné aux indépendants
          et petites entreprises (« l'Utilisateur »). Les présentes conditions régissent l'accès et
          l'utilisation du service.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">2. Accès au service et tarifs</h2>
        <p class="mt-2">
          Le service est actuellement proposé gratuitement, sans engagement. L'éditeur se réserve
          la possibilité de faire évoluer les fonctionnalités et modalités d'accès du service ; les
          Utilisateurs en seront informés à l'avance en cas d'introduction d'une offre payante.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">3. Compte utilisateur</h2>
        <p class="mt-2">
          L'accès nécessite la création d'un compte (email et mot de passe). L'Utilisateur est seul
          responsable de la confidentialité de ses identifiants et de l'ensemble des actions
          effectuées depuis son compte.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">4. Responsabilité relative aux documents émis</h2>
        <p class="mt-2">
          Reglo fournit un outil de mise en forme de devis et factures. L'Utilisateur demeure seul
          responsable de l'exactitude des informations saisies, du respect des mentions légales et
          fiscales obligatoires applicables à son activité (numérotation, TVA, délais de paiement,
          etc.) et, plus généralement, de la conformité des documents émis avec la réglementation
          en vigueur.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">5. Paiement en ligne des factures</h2>
        <p class="mt-2">
          Reglo permet aux clients de l'Utilisateur de régler une facture en ligne via le
          prestataire de paiement Stripe. Reglo n'est à aucun moment dépositaire des fonds : les
          paiements sont traités directement par Stripe et reversés à l'Utilisateur selon les
          conditions propres à Stripe, que l'Utilisateur doit accepter séparément lors de la
          configuration de son compte de paiement.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">6. Disponibilité du service</h2>
        <p class="mt-2">
          L'éditeur s'efforce d'assurer une disponibilité continue du service mais ne garantit pas
          l'absence d'interruptions, notamment pour maintenance. La responsabilité de l'éditeur ne
          saurait être engagée en cas d'indisponibilité temporaire ou de perte de données résultant
          d'un cas de force majeure.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">7. Résiliation</h2>
        <p class="mt-2">
          L'Utilisateur peut supprimer son compte à tout moment. L'éditeur peut suspendre ou
          supprimer un compte en cas d'usage non conforme aux présentes conditions ou à la loi.
        </p>
      </section>

      <section>
        <h2 class="font-display text-lg font-semibold text-ink">8. Droit applicable</h2>
        <p class="mt-2">
          Les présentes conditions sont soumises au droit français. Tout litige relève des
          tribunaux compétents de <strong>[VILLE À COMPLÉTER]</strong>, sous réserve des règles
          protectrices applicables aux consommateurs.
        </p>
      </section>
    </div>
  </main>
</template>
