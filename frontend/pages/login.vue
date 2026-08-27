<script setup lang="ts">
const { request } = useApi()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)
const needsVerification = ref(false)
const resendState = ref<'idle' | 'sending' | 'sent'>('idle')

async function submit() {
  loading.value = true
  errorMsg.value = ''
  needsVerification.value = false
  resendState.value = 'idle'
  try {
    const res = await request<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    auth.setSession(res.accessToken, res.user)
    router.push((route.query.redirect as string) || '/dashboard')
  } catch (e: any) {
    if (e?.data?.message === 'EMAIL_NOT_VERIFIED') {
      needsVerification.value = true
    } else {
      errorMsg.value = 'Email ou mot de passe incorrect.'
    }
  } finally {
    loading.value = false
  }
}

async function resendVerification() {
  resendState.value = 'sending'
  try {
    await request('/auth/resend-verification', { method: 'POST', body: { email: email.value } })
  } finally {
    resendState.value = 'sent'
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
      <div v-if="needsVerification" class="rounded-lg border border-indigo/20 bg-indigo-light p-3 font-body text-sm text-ink/80">
        <p>Confirme ton adresse email avant de te connecter (vérifie tes spams).</p>
        <button
          type="button"
          :disabled="resendState !== 'idle'"
          class="mt-1.5 font-medium text-indigo underline disabled:no-underline disabled:opacity-60"
          @click="resendVerification"
        >
          {{ resendState === 'sent' ? 'Email renvoyé ✓' : resendState === 'sending' ? 'Envoi…' : "Renvoyer l'email de confirmation" }}
        </button>
      </div>
      <button type="submit" :disabled="loading" class="focus-ring w-full rounded-lg bg-indigo px-6 py-3.5 font-display font-semibold text-white disabled:opacity-60">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>

    <p class="mt-6 text-center font-body text-sm text-muted">
      Pas encore de compte ? <NuxtLink to="/register" class="text-indigo underline">Inscris-toi</NuxtLink>
    </p>
  </main>
</template>
