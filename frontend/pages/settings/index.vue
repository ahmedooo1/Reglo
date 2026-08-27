<script setup lang="ts">
const { request } = useApi()
const auth = useAuthStore()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)

const form = reactive({
  companyName: '',
  siret: '',
  vatNumber: '',
  address: '',
  iban: '',
  defaultPaymentTermsDays: 30,
})

onMounted(async () => {
  auth.restore()
  if (!auth.user) {
    router.push('/login?redirect=/settings')
    return
  }
  try {
    const me = await request<any>('/users/me', { auth: true })
    Object.assign(form, {
      companyName: me.companyName || '',
      siret: me.siret || '',
      vatNumber: me.vatNumber || '',
      address: me.address || '',
      iban: me.iban || '',
      defaultPaymentTermsDays: me.defaultPaymentTermsDays || 30,
    })
  } finally {
    loading.value = false
  }
})

async function submit() {
  saving.value = true
  saved.value = false
  try {
    await request('/users/me', { method: 'PATCH', auth: true, body: { ...form } })
    saved.value = true
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-2xl px-6 py-14">
    <h1 class="font-display text-3xl font-bold text-ink">Profil de l'entreprise</h1>
    <p class="mt-2 font-body text-sm text-muted">
      Ces informations apparaissent sur tous tes devis et factures.
    </p>

    <div v-if="loading" class="mt-8 font-body text-muted">Chargement...</div>

    <form v-else class="mt-8 space-y-5 rounded-2xl border border-line bg-white p-6 shadow-card" @submit.prevent="submit">
      <div>
        <label class="mb-1.5 block font-body text-sm text-ink/80">Nom de l'entreprise</label>
        <input v-model="form.companyName" class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 text-ink" />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block font-body text-sm text-ink/80">SIRET</label>
          <input v-model="form.siret" class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 font-mono text-sm text-ink" />
        </div>
        <div>
          <label class="mb-1.5 block font-body text-sm text-ink/80">N&deg; TVA intracommunautaire</label>
          <input v-model="form.vatNumber" class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 font-mono text-sm text-ink" />
        </div>
      </div>
      <div>
        <label class="mb-1.5 block font-body text-sm text-ink/80">Adresse</label>
        <textarea v-model="form.address" rows="2" class="focus-ring w-full resize-none rounded-lg border border-line px-3 py-2.5 text-ink" />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block font-body text-sm text-ink/80">IBAN</label>
          <input v-model="form.iban" class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 font-mono text-sm text-ink" />
        </div>
        <div>
          <label class="mb-1.5 block font-body text-sm text-ink/80">Délai de paiement par défaut (jours)</label>
          <input v-model.number="form.defaultPaymentTermsDays" type="number" class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 text-ink" />
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button type="submit" :disabled="saving" class="focus-ring rounded-lg bg-indigo px-6 py-3 font-body text-sm font-semibold text-white disabled:opacity-60">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <span v-if="saved" class="font-body text-sm text-emerald">Enregistré &#10003;</span>
      </div>
    </form>
  </main>
</template>
