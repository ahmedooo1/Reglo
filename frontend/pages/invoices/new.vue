<script setup lang="ts">
interface Client { id: string; name: string }

const { request } = useApi()
const auth = useAuthStore()
const router = useRouter()

const clients = ref<Client[]>([])
const clientId = ref('')
const dueDate = ref('')
const notes = ref('')
const items = ref([{ description: '', quantity: 1, unitPriceCents: 0, vatRate: 20 }])
const saving = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  auth.restore()
  if (!auth.user) {
    router.push('/login?redirect=/invoices/new')
    return
  }
  clients.value = await request<Client[]>('/clients', { auth: true })
  const in30Days = new Date()
  in30Days.setDate(in30Days.getDate() + 30)
  dueDate.value = in30Days.toISOString().slice(0, 10)
})

async function submit() {
  if (!clientId.value) {
    errorMsg.value = 'Choisis un client.'
    return
  }
  saving.value = true
  errorMsg.value = ''
  try {
    const invoice = await request<{ id: string }>('/invoices', {
      method: 'POST',
      auth: true,
      body: {
        clientId: clientId.value,
        items: items.value.filter((i) => i.description.trim()),
        dueDate: dueDate.value || undefined,
        notes: notes.value || undefined,
      },
    })
    router.push(`/invoices/${invoice.id}`)
  } catch (e) {
    errorMsg.value = "La creation de la facture a echoue."
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-14">
    <h1 class="font-display text-3xl font-bold text-ink">Nouvelle facture</h1>

    <div v-if="!clients.length" class="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
      <p class="font-body text-sm text-muted">
        Tu dois d'abord ajouter un client.
        <NuxtLink to="/clients" class="text-indigo underline">Ajouter un client</NuxtLink>
      </p>
    </div>

    <form v-else class="mt-6 space-y-6" @submit.prevent="submit">
      <div class="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block font-body text-sm text-ink/80">Client</label>
            <select v-model="clientId" required class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 text-ink">
              <option value="" disabled>Choisir un client</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block font-body text-sm text-ink/80">Echeance</label>
            <input v-model="dueDate" type="date" class="focus-ring w-full rounded-lg border border-line px-3 py-2.5 text-ink" />
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-line bg-white p-6 shadow-card">
        <LineItemsEditor v-model="items" />
      </div>

      <div class="rounded-2xl border border-line bg-white p-6 shadow-card">
        <label class="mb-1.5 block font-body text-sm text-ink/80">Notes</label>
        <textarea v-model="notes" rows="3" class="focus-ring w-full resize-none rounded-lg border border-line px-3 py-2.5 text-ink" />
      </div>

      <p v-if="errorMsg" class="font-body text-sm text-rose">{{ errorMsg }}</p>

      <button type="submit" :disabled="saving" class="focus-ring rounded-lg bg-indigo px-6 py-3.5 font-display font-semibold text-white disabled:opacity-60">
        {{ saving ? 'Creation...' : 'Creer la facture' }}
      </button>
    </form>
  </main>
</template>
