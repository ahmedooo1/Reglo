<script setup lang="ts">
const { request } = useApi()
const route = useRoute()
const status = ref<'loading' | 'ok' | 'error'>('loading')
let fired = false

onMounted(() => {
  if (fired) return
  fired = true
  request('/auth/verify-email', { method: 'POST', body: { token: route.params.token } })
    .then(() => (status.value = 'ok'))
    .catch(() => (status.value = 'error'))
})
</script>

<template>
  <main class="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
    <div class="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
      <p v-if="status === 'loading'" class="font-body text-muted">Vérification en cours…</p>
      <template v-else-if="status === 'ok'">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-light text-2xl">
          ✓
        </div>
        <h1 class="mt-4 font-display text-xl font-bold text-ink">Email confirmé</h1>
        <p class="mt-2 font-body text-sm text-muted">Ton adresse est vérifiée.</p>
        <NuxtLink to="/login" class="mt-6 inline-block rounded-lg bg-indigo px-6 py-2.5 font-display font-semibold text-white">
          Se connecter
        </NuxtLink>
      </template>
      <template v-else>
        <h1 class="font-display text-xl font-bold text-ink">Lien invalide ou expiré</h1>
        <p class="mt-2 font-body text-sm text-muted">Reconnecte-toi pour recevoir un nouveau lien.</p>
      </template>
    </div>
  </main>
</template>
