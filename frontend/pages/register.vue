<script setup lang="ts">
const { request } = useApi()

const name = ref('')
const email = ref('')
const password = ref('')
const acceptedTerms = ref(false)
const errorMsg = ref('')
const loading = ref(false)
const registeredEmail = ref('')

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

      <p class="mt-6 text-center font-body text-sm text-muted">
        Déjà inscrit ? <NuxtLink to="/login" class="text-indigo underline">Connecte-toi</NuxtLink>
      </p>
    </template>
  </main>
</template>
