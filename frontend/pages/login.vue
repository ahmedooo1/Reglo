<script setup lang="ts">
const { request } = useApi()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await request<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    auth.setSession(res.accessToken, res.user)
    router.push((route.query.redirect as string) || '/dashboard')
  } catch (e) {
    errorMsg.value = 'Email ou mot de passe incorrect.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
    <h1 class="font-display text-3xl font-bold text-ink">Content de te revoir</h1>
    <p class="mt-2 font-body text-sm text-muted">Connecte-toi pour retrouver tes devis et factures.</p>

    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1.5 block font-body text-sm text-ink/80">Email</label>
        <input v-model="email" type="email" required class="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-ink" />
      </div>
      <div>
        <label class="mb-1.5 block font-body text-sm text-ink/80">Mot de passe</label>
        <input v-model="password" type="password" required class="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-ink" />
      </div>
      <p v-if="errorMsg" class="font-body text-sm text-rose">{{ errorMsg }}</p>
      <button type="submit" :disabled="loading" class="focus-ring w-full rounded-lg bg-indigo px-6 py-3.5 font-display font-semibold text-white disabled:opacity-60">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>

    <p class="mt-6 text-center font-body text-sm text-muted">
      Pas encore de compte ? <NuxtLink to="/register" class="text-indigo underline">Inscris-toi</NuxtLink>
    </p>
  </main>
</template>
