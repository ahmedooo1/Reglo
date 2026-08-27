<template>
  <footer class="mt-24 border-t border-line">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-muted md:flex-row">
      <p class="font-display font-semibold text-ink">reglo</p>
      <p>Devis et factures, sans prise de tête.</p>
      <div class="flex gap-4">
        <NuxtLink to="/legal/mentions-legales" class="hover:text-ink">Mentions légales</NuxtLink>
        <NuxtLink to="/legal/cgu" class="hover:text-ink">CGU / CGV</NuxtLink>
        <NuxtLink to="/legal/confidentialite" class="hover:text-ink">Confidentialité</NuxtLink>
      </div>
      <p>&copy; {{ new Date().getFullYear() }} Reglo</p>
    </div>
  </footer>
</template>
