<script setup lang="ts">
interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  siret?: string
}

const { request } = useApi()
const auth = useAuthStore()
const router = useRouter()

const clients = ref<Client[]>([])
const loading = ref(true)
const saving = ref(false)
const showForm = ref(false)
const errorMsg = ref('')

const form = reactive({ name: '', email: '', phone: '', address: '', siret: '' })

async function load() {
  clients.value = await request<Client[]>('/clients', { auth: true })
}

onMounted(async () => {
  auth.restore()
  if (!auth.user) {
    router.push('/login?redirect=/clients')
    return
  }
  try {
    await load()
  } finally {
    loading.value = false
  }
})

async function submit() {
  saving.value = true
  errorMsg.value = ''
  try {
    await request('/clients', { method: 'POST', auth: true, body: { ...form } })
    Object.assign(form, { name: '', email: '', phone: '', address: '', siret: '' })
    showForm.value = false
    await load()
  } catch (e) {
    errorMsg.value = "Impossible d'ajouter ce client."
  } finally {
    saving.value = false
  }
}

async function remove(id: string) {
  await request(`/clients/${id}`, { method: 'DELETE', auth: true })
  await load()
}
</script>

<template>
  <main class="mx-auto max-w-4xl px-6 py-14">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="font-display text-3xl font-bold text-ink">Clients</h1>
      <button class="rounded-lg bg-indigo px-4 py-2.5 font-body text-sm font-semibold text-white" @click="showForm = !showForm">
        {{ showForm ? 'Annuler' : '+ Nouveau client' }}
      </button>
    </div>

    <form v-if="showForm" class="mb-10 grid gap-4 rounded-2xl border border-line bg-white p-6 shadow-card sm:grid-cols-2" @submit.prevent="submit">
      <div class="sm:col-span-2">
        <label class="mb-1.5 block font-body text-sm text-ink/80">Nom / Raison sociale</label>
        <input v-model="form.name" required class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 text-ink" />
      </div>
      <div>
        <label class="mb-1.5 block font-body text-sm text-ink/80">Email</label>
        <input v-model="form.email" type="email" class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 text-ink" />
      </div>
      <div>
        <label class="mb-1.5 block font-body text-sm text-ink/80">Telephone</label>
        <input v-model="form.phone" class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 text-ink" />
      </div>
      <div class="sm:col-span-2">
        <label class="mb-1.5 block font-body text-sm text-ink/80">Adresse</label>
        <input v-model="form.address" class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 text-ink" />
      </div>
      <div>
        <label class="mb-1.5 block font-body text-sm text-ink/80">SIRET (optionnel)</label>
        <input v-model="form.siret" class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 text-ink" />
      </div>
      <p v-if="errorMsg" class="font-body text-sm text-rose sm:col-span-2">{{ errorMsg }}</p>
      <button type="submit" :disabled="saving" class="focus-ring rounded-lg bg-indigo px-5 py-2.5 font-body text-sm font-semibold text-white sm:col-span-2 sm:w-fit">
        {{ saving ? 'Ajout...' : 'Ajouter le client' }}
      </button>
    </form>

    <div v-if="loading" class="font-body text-muted">Chargement...</div>

    <div v-else-if="!clients.length" class="rounded-2xl border border-line bg-white p-10 text-center shadow-card">
      <p class="font-body text-muted">Aucun client enregistre pour l'instant.</p>
    </div>

    <div v-else class="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div v-for="c in clients" :key="c.id" class="flex items-center justify-between px-5 py-4">
        <div>
          <p class="font-body text-sm font-semibold text-ink">{{ c.name }}</p>
          <p class="font-body text-xs text-muted">{{ [c.email, c.phone].filter(Boolean).join(' · ') }}</p>
        </div>
        <button class="font-body text-xs font-medium text-rose" @click="remove(c.id)">Supprimer</button>
      </div>
    </div>
  </main>
</template>
