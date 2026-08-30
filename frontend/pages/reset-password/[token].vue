<script setup lang="ts">
const { request } = useApi()
const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const done = ref(false)

async function submit() {
  errorMsg.value = ''
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Les deux mots de passe ne correspondent pas.'
    return
  }
  loading.value = true
  try {
    await request('/auth/reset-password', {
      method: 'POST',
      body: { token: route.params.token, password: password.value },
    })
    done.value = true
    setTimeout(() => router.push('/login'), 2000)
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Lien invalide ou expiré. Refais une demande.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
    <template v-if="!done">
      <h1 class="font-display text-3xl font-bold text-ink">Nouveau mot de passe</h1>
      <p class="mt-2 font-body text-sm text-muted">Choisis un nouveau mot de passe pour ton compte.</p>

      <form class="mt-8 space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block font-body text-sm text-ink/80">Nouveau mot de passe</label>
          <input v-model="password" type="password" required minlength="8" class="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-ink" />
        </div>
        <div>
          <label class="mb-1.5 block font-body text-sm text-ink/80">Confirme le mot de passe</label>
          <input v-model="confirmPassword" type="password" required minlength="8" class="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-ink" />
        </div>
        <p v-if="errorMsg" class="font-body text-sm text-rose">{{ errorMsg }}</p>
        <button type="submit" :disabled="loading" class="focus-ring w-full rounded-lg bg-indigo px-6 py-3.5 font-display font-semibold text-white disabled:opacity-60">
          {{ loading ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe' }}
        </button>
      </form>
    </template>

    <div v-else class="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-light text-2xl">✓</div>
      <h1 class="mt-4 font-display text-xl font-bold text-ink">Mot de passe mis à jour</h1>
      <p class="mt-2 font-body text-sm text-muted">Redirection vers la connexion...</p>
    </div>
  </main>
</template>
