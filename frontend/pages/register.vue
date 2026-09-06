<script setup lang="ts">
const { request } = useApi()
const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const acceptedTerms = ref(false)
const errorMsg = ref('')
const loading = ref(false)
const registeredEmail = ref('')

onMounted(() => {
  if (auth.user) router.push('/dashboard')
})

async function submit() {
  if (!acceptedTerms.value) {
    errorMsg.value = "Merci d'accepter les CGU pour créer un compte."
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await request<{ requiresVerification: boolean; email: string }>('/auth/register', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value },
    })
    registeredEmail.value = email.value
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Inscription impossible pour le moment.'
  } finally {
    loading.value = false
  }
}

function onGoogleSuccess(session: { accessToken: string; user: any }) {
  auth.setSession(session.accessToken, session.user)
  router.push('/dashboard')
}

function blockedGoogleClick() {
  errorMsg.value = "Merci d'accepter les CGU avant de continuer avec Google."
}

function onGoogleError(message: string) {
  errorMsg.value = message
}
</script>

<template>
  <main class="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
    <template v-if="registeredEmail">
      <div class="rounded-2xl border border-line bg-white p-7 text-center shadow-card">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-light text-2xl">
          ✉️
        </div>
        <h1 class="mt-4 font-display text-xl font-bold text-ink">Vérifie ta boîte mail</h1>
        <p class="mt-2 font-body text-sm text-muted">
          On a envoyé un lien de confirmation à <strong>{{ registeredEmail }}</strong>. Clique
          dessus pour activer ton compte, puis connecte-toi.
        </p>
        <NuxtLink
          to="/login"
          class="mt-6 inline-block rounded-lg bg-indigo px-6 py-2.5 font-display font-semibold text-white"
        >
          Aller à la connexion
        </NuxtLink>
      </div>
    </template>
    <template v-else>
      <h1 class="font-display text-3xl font-bold text-ink">Crée ton compte</h1>
      <p class="mt-2 font-body text-sm text-muted">Gratuit, en moins d'une minute.</p>

      <form class="mt-8 space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block font-body text-sm text-ink/80">Prénom</label>
          <input v-model="name" type="text" required class="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-ink" />
        </div>
        <div>
          <label class="mb-1.5 block font-body text-sm text-ink/80">Email</label>
          <input v-model="email" type="email" required class="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-ink" />
        </div>
        <div>
          <label class="mb-1.5 block font-body text-sm text-ink/80">Mot de passe</label>
          <input v-model="password" type="password" required minlength="8" class="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-ink" />
        </div>
        <label class="flex items-start gap-2.5 font-body text-sm text-ink/80">
          <input v-model="acceptedTerms" type="checkbox" class="focus-ring mt-0.5 h-4 w-4 rounded border-line" />
          <span>
            J'accepte les
            <NuxtLink to="/legal/cgu" target="_blank" class="text-indigo underline">CGU</NuxtLink>
            et la
            <NuxtLink to="/legal/confidentialite" target="_blank" class="text-indigo underline">politique de confidentialité</NuxtLink>
          </span>
        </label>
        <p v-if="errorMsg" class="font-body text-sm text-rose">{{ errorMsg }}</p>
        <button type="submit" :disabled="loading" class="focus-ring w-full rounded-lg bg-indigo px-6 py-3.5 font-display font-semibold text-white disabled:opacity-60">
          {{ loading ? 'Création...' : 'Créer mon compte' }}
        </button>
      </form>

      <div class="my-6 flex items-center gap-3">
        <div class="h-px flex-1 bg-line"></div>
        <span class="text-xs uppercase tracking-wide text-muted">ou</span>
        <div class="h-px flex-1 bg-line"></div>
      </div>
      <div class="flex justify-center">
        <GoogleSignInButton v-if="acceptedTerms" @success="onGoogleSuccess" @error="onGoogleError" />
        <button
          v-else
          type="button"
          class="focus-ring flex items-center gap-2.5 rounded-lg border border-line bg-white px-6 py-2.5 font-body text-sm text-muted"
          @click="blockedGoogleClick"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 009 18z" />
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.17.27-1.7V4.97H.98A9 9 0 000 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
          </svg>
          Continuer avec Google
        </button>
      </div>

      <p class="mt-6 text-center font-body text-sm text-muted">
        Déjà inscrit ? <NuxtLink to="/login" class="text-indigo underline">Connecte-toi</NuxtLink>
      </p>
    </template>
  </main>
</template>
