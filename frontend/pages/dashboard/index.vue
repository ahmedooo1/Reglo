<script setup lang="ts">
interface Quote {
  id: string
  number: string
  status: string
  items: { quantity: number; unitPriceCents: number; vatRate: number }[]
  client: { name: string }
  createdAt: string
}
interface Invoice extends Quote {
  isOverdue?: boolean
  dueDate?: string
}

const { request } = useApi()
const auth = useAuthStore()
const router = useRouter()

const quotes = ref<Quote[]>([])
const invoices = ref<Invoice[]>([])
const loading = ref(true)
const tab = ref<'invoices' | 'quotes'>('invoices')

function totalTTC(items: { quantity: number; unitPriceCents: number; vatRate: number }[]) {
  let subtotal = 0
  let vat = 0
  for (const i of items) {
    const lineTotal = i.quantity * i.unitPriceCents
    subtotal += lineTotal
    vat += Math.round((lineTotal * i.vatRate) / 100)
  }
  return subtotal + vat
}

function euros(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const invoicedPaidCents = computed(() =>
  invoices.value.filter((i) => i.status === 'payee').reduce((s, i) => s + totalTTC(i.items), 0),
)
const pendingCents = computed(() =>
  invoices.value.filter((i) => i.status !== 'payee').reduce((s, i) => s + totalTTC(i.items), 0),
)

onMounted(async () => {
  auth.restore()
  if (!auth.user) {
    router.push('/login?redirect=/dashboard')
    return
  }
  try {
    const [q, i] = await Promise.all([
      request<Quote[]>('/quotes', { auth: true }),
      request<Invoice[]>('/invoices', { auth: true }),
    ])
    quotes.value = q
    invoices.value = i
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-14">
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-display text-3xl font-bold text-ink">Tableau de bord</h1>
      <div class="flex gap-3">
        <NuxtLink to="/quotes/new" class="rounded-lg border border-line bg-white px-4 py-2.5 font-body text-sm font-medium text-ink transition hover:bg-indigo-light">
          + Devis
        </NuxtLink>
        <NuxtLink to="/invoices/new" class="rounded-lg bg-indigo px-4 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-indigo-dark">
          + Facture
        </NuxtLink>
      </div>
    </div>

    <div v-if="!loading" class="mb-10 grid gap-4 sm:grid-cols-2">
      <div class="rounded-2xl border border-line bg-white p-5 shadow-card">
        <p class="font-body text-xs uppercase tracking-wide text-muted">Encaisse</p>
        <p class="mt-1 font-mono text-2xl font-bold tabular text-emerald">{{ euros(invoicedPaidCents) }} &euro;</p>
      </div>
      <div class="rounded-2xl border border-line bg-white p-5 shadow-card">
        <p class="font-body text-xs uppercase tracking-wide text-muted">En attente</p>
        <p class="mt-1 font-mono text-2xl font-bold tabular text-amber">{{ euros(pendingCents) }} &euro;</p>
      </div>
    </div>

    <div class="mb-6 flex gap-2 border-b border-line">
      <button
        class="px-1 pb-3 font-body text-sm font-medium"
        :class="tab === 'invoices' ? 'border-b-2 border-indigo text-ink' : 'text-muted'"
        @click="tab = 'invoices'"
      >
        Factures
      </button>
      <button
        class="ml-6 px-1 pb-3 font-body text-sm font-medium"
        :class="tab === 'quotes' ? 'border-b-2 border-indigo text-ink' : 'text-muted'"
        @click="tab = 'quotes'"
      >
        Devis
      </button>
    </div>

    <div v-if="loading" class="font-body text-muted">Chargement...</div>

    <div v-else-if="tab === 'invoices'" class="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <table class="w-full text-left font-body text-sm">
        <thead class="border-b border-line bg-paper/60 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th class="px-5 py-3">N&deg;</th>
            <th class="px-5 py-3">Client</th>
            <th class="px-5 py-3 text-right">Total TTC</th>
            <th class="px-5 py-3">Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!invoices.length"><td colspan="4" class="px-5 py-8 text-center text-muted">Aucune facture pour l'instant.</td></tr>
          <tr
            v-for="inv in invoices"
            :key="inv.id"
            class="cursor-pointer border-b border-line last:border-0 hover:bg-paper/60"
            @click="router.push(`/invoices/${inv.id}`)"
          >
            <td class="px-5 py-3 font-mono">{{ inv.number }}</td>
            <td class="px-5 py-3">{{ inv.client.name }}</td>
            <td class="px-5 py-3 text-right font-mono tabular">{{ euros(totalTTC(inv.items)) }} &euro;</td>
            <td class="px-5 py-3"><StatusPill :status="inv.status" :overdue="inv.isOverdue" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <table class="w-full text-left font-body text-sm">
        <thead class="border-b border-line bg-paper/60 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th class="px-5 py-3">N&deg;</th>
            <th class="px-5 py-3">Client</th>
            <th class="px-5 py-3 text-right">Total TTC</th>
            <th class="px-5 py-3">Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!quotes.length"><td colspan="4" class="px-5 py-8 text-center text-muted">Aucun devis pour l'instant.</td></tr>
          <tr
            v-for="q in quotes"
            :key="q.id"
            class="cursor-pointer border-b border-line last:border-0 hover:bg-paper/60"
            @click="router.push(`/quotes/${q.id}`)"
          >
            <td class="px-5 py-3 font-mono">{{ q.number }}</td>
            <td class="px-5 py-3">{{ q.client.name }}</td>
            <td class="px-5 py-3 text-right font-mono tabular">{{ euros(totalTTC(q.items)) }} &euro;</td>
            <td class="px-5 py-3"><StatusPill :status="q.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
