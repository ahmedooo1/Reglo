<script setup lang="ts">
const { request } = useApi()

const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function submit() {
  loading.value = true
  try {
    await request('/auth/forgot-password', { method: 'POST', body: { email: email.value } })
    sent.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
    <template v-if="!sent">
      <h1 class="font-display text-3xl font-bold text-ink">Mot de passe oublié</h1>
      <p class="mt-2 font-body text-sm text-muted">Indique ton email, on t'envoie un lien pour en choisir un nouveau.</p>

      <form class="mt-8 space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block font-body text-sm text-ink/80">Email</label>
          <input v-model="email" type="email" required class="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-ink" />
        </div>
        <button type="submit" :disabled="loading" class="focus-ring w-full rounded-lg bg-indigo px-6 py-3.5 font-display font-semibold text-white disabled:opacity-60">
          {{ loading ? 'Envoi...' : 'Envoyer le lien' }}
        </button>
      </form>
    </template>

    <div v-else class="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-light text-2xl">✓</div>
      <h1 class="mt-4 font-display text-xl font-bold text-ink">Email envoyé</h1>
      <p class="mt-2 font-body text-sm text-muted">Si un compte existe avec cette adresse, un lien de réinitialisation vient d'être envoyé (vérifie tes spams).</p>
      <NuxtLink to="/login" class="mt-6 inline-block rounded-lg bg-indigo px-6 py-2.5 font-display font-semibold text-white">
        Retour à la connexion
      </NuxtLink>
    </div>
  </main>
</template>
