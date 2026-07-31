<script setup lang="ts">
interface InvoiceItem { description: string; quantity: number; unitPriceCents: number; vatRate: number }
interface PublicInvoice {
  number: string
  status: string
  isOverdue?: boolean
  client: { name: string }
  items: InvoiceItem[]
  dueDate?: string
  notes?: string
}

const route = useRoute()
const { request } = useApi()
const config = useRuntimeConfig()

const invoice = ref<PublicInvoice | null>(null)
const loading = ref(true)
const notFound = ref(false)
const payingLoading = ref(false)

function totals(items: InvoiceItem[]) {
  let subtotal = 0
  let vat = 0
  for (const i of items) {
    const lineTotal = i.quantity * i.unitPriceCents
    subtotal += lineTotal
    vat += Math.round((lineTotal * i.vatRate) / 100)
  }
  return { subtotal, vat, total: subtotal + vat }
}
function euros(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(async () => {
  try {
    invoice.value = await request<PublicInvoice>(`/invoices/public/${route.params.token}`)
  } catch (e) {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

async function payNow() {
  payingLoading.value = true
  try {
    const session = await request<{ url: string }>(`/payments/invoice/${route.params.token}/checkout-session`, {
      method: 'POST',
    })
    if (session.url) window.location.href = session.url
  } finally {
    payingLoading.value = false
  }
}

function downloadPdf() {
  window.open(`${config.public.apiBase}/invoices/public/${route.params.token}/pdf`, '_blank')
}
</script>

<template>
  <main class="mx-auto max-w-2xl px-6 py-14">
    <div v-if="loading" class="font-body text-muted">Chargement de la facture...</div>

    <div v-else-if="notFound" class="rounded-2xl border border-line bg-white p-10 text-center shadow-card">
      <p class="font-body text-ink">Cette facture n'existe plus.</p>
    </div>

    <div v-else-if="invoice" class="rounded-2xl border border-line bg-white p-8 shadow-card">
      <div class="mb-6 flex items-start justify-between">
        <div>
          <p class="font-display text-xl font-bold text-ink">Facture {{ invoice.number }}</p>
          <p class="mt-1 font-body text-sm text-muted">Pour {{ invoice.client.name }}</p>
        </div>
        <StatusPill :status="invoice.status" :overdue="invoice.isOverdue" />
      </div>

      <div class="space-y-2.5 border-t border-line pt-5">
        <div v-for="(item, i) in invoice.items" :key="i" class="flex justify-between font-body text-sm">
          <span class="text-ink/80">{{ item.description }} &times;{{ item.quantity }}</span>
          <span class="font-mono tabular text-ink">{{ euros(item.quantity * item.unitPriceCents) }} &euro;</span>
        </div>
      </div>

      <div class="mt-5 flex justify-between border-t border-line pt-4 font-display text-lg font-bold text-ink">
        <span>Total TTC</span>
        <span class="font-mono tabular">{{ euros(totals(invoice.items).total) }} &euro;</span>
      </div>

      <p v-if="invoice.notes" class="mt-4 font-body text-sm text-muted">{{ invoice.notes }}</p>

      <div class="mt-8 flex flex-wrap gap-3">
        <button
          v-if="invoice.status !== 'payee'"
          :disabled="payingLoading"
          class="rounded-lg bg-indigo px-5 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-60"
          @click="payNow"
        >
          {{ payingLoading ? 'Redirection...' : 'Payer en ligne' }}
        </button>
        <p v-else class="font-body text-sm font-medium text-emerald">Facture deja payee, merci !</p>
        <button class="rounded-lg border border-line px-5 py-2.5 font-body text-sm font-medium text-ink" @click="downloadPdf">
          Telecharger le PDF
        </button>
      </div>
    </div>
  </main>
</template>
