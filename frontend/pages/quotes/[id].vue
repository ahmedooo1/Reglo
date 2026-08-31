<script setup lang="ts">
interface QuoteItem { description: string; quantity: number; unitPriceCents: number; vatRate: number }
interface Quote {
  id: string
  number: string
  status: string
  publicToken: string
  client: { name: string; email?: string; address?: string }
  items: QuoteItem[]
  validUntil?: string
  notes?: string
  createdAt: string
  acceptedByName?: string
  acceptedAt?: string
  acceptedIp?: string
}

const route = useRoute()
const router = useRouter()
const { request } = useApi()
const auth = useAuthStore()
const config = useRuntimeConfig()

const quote = ref<Quote | null>(null)
const loading = ref(true)
const converting = ref(false)
const linkCopied = ref(false)
const sending = ref(false)
const sendError = ref('')
const sent = ref(false)

function totals(items: QuoteItem[]) {
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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

async function load() {
  quote.value = await request<Quote>(`/quotes/${route.params.id}`, { auth: true })
}

onMounted(async () => {
  auth.restore()
  if (!auth.user) {
    router.push(`/login?redirect=/quotes/${route.params.id}`)
    return
  }
  try {
    await load()
  } finally {
    loading.value = false
  }
})

async function setStatus(status: string) {
  await request(`/quotes/${route.params.id}/status`, { method: 'PATCH', auth: true, body: { status } })
  await load()
}

function copyPublicLink() {
  if (!quote.value) return
  const url = `${window.location.origin}/d/${quote.value.publicToken}`
  navigator.clipboard?.writeText(url)
  linkCopied.value = true
  setTimeout(() => (linkCopied.value = false), 1500)
}

async function downloadPdf() {
  if (!quote.value) return
  const blob = await $fetch<Blob>(`${config.public.apiBase}/quotes/${quote.value.id}/pdf`, {
    headers: { Authorization: `Bearer ${auth.token}` },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(blob as Blob)
  window.open(url, '_blank')
}

async function sendToClient() {
  if (!quote.value) return
  sending.value = true
  sendError.value = ''
  sent.value = false
  try {
    await request(`/quotes/${quote.value.id}/send`, { method: 'POST', auth: true })
    sent.value = true
    await load()
  } catch (e: any) {
    sendError.value = e?.data?.message || "Impossible d'envoyer l'email."
  } finally {
    sending.value = false
  }
}

async function convertToInvoice() {
  if (!quote.value) return
  converting.value = true
  try {
    const invoice = await request<{ id: string }>('/invoices', {
      method: 'POST',
      auth: true,
      body: {
        clientId: (quote.value as any).client.id,
        items: quote.value.items,
        notes: quote.value.notes,
        sourceQuoteId: quote.value.id,
      },
    })
    router.push(`/invoices/${invoice.id}`)
  } finally {
    converting.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-14">
    <div v-if="loading" class="font-body text-muted">Chargement...</div>

    <div v-else-if="quote">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold text-ink">Devis {{ quote.number }}</h1>
          <p class="mt-1 font-body text-sm text-muted">{{ quote.client.name }}</p>
        </div>
        <StatusPill :status="quote.status" />
      </div>

      <div class="mb-6 flex flex-wrap gap-3">
        <button v-if="quote.status === 'brouillon'" class="rounded-lg bg-indigo px-4 py-2 font-body text-sm font-semibold text-white" @click="setStatus('envoye')">
          Marquer comme envoyé
        </button>
        <button v-if="quote.status === 'envoye'" class="rounded-lg bg-emerald px-4 py-2 font-body text-sm font-semibold text-white" @click="setStatus('accepte')">
          Marquer comme accepté
        </button>
        <button v-if="quote.status === 'envoye'" class="rounded-lg border border-line px-4 py-2 font-body text-sm font-medium text-ink" @click="setStatus('refuse')">
          Marquer comme refusé
        </button>
        <button v-if="quote.status === 'accepte'" :disabled="converting" class="rounded-lg bg-indigo px-4 py-2 font-body text-sm font-semibold text-white disabled:opacity-60" @click="convertToInvoice">
          {{ converting ? 'Conversion...' : 'Convertir en facture' }}
        </button>
        <button class="rounded-lg border border-line px-4 py-2 font-body text-sm font-medium text-ink" @click="downloadPdf">
          Télécharger le PDF
        </button>
        <button class="rounded-lg border border-line px-4 py-2 font-body text-sm font-medium text-ink" @click="copyPublicLink">
          {{ linkCopied ? 'Lien copié !' : 'Copier le lien client' }}
        </button>
        <button
          v-if="quote.client.email"
          :disabled="sending"
          class="rounded-lg border border-line px-4 py-2 font-body text-sm font-medium text-ink disabled:opacity-60"
          @click="sendToClient"
        >
          {{ sending ? 'Envoi...' : sent ? 'Email envoyé ✓' : 'Envoyer par email' }}
        </button>
        <span v-else class="self-center font-body text-xs text-muted">
          Ajoute un email au client pour pouvoir lui envoyer ce devis directement.
        </span>
      </div>
      <p v-if="sendError" class="mb-4 font-body text-sm text-rose">{{ sendError }}</p>

      <div v-if="quote.status === 'accepte' && quote.acceptedByName" class="mb-6 rounded-lg border border-emerald/25 bg-emerald-light px-4 py-3 font-body text-sm text-ink">
        <p class="font-semibold text-emerald">Accepté par {{ quote.acceptedByName }}</p>
        <p class="mt-0.5 text-xs text-muted">
          {{ quote.acceptedAt ? formatDateTime(quote.acceptedAt) : '' }}<span v-if="quote.acceptedIp"> · IP {{ quote.acceptedIp }}</span>
        </p>
      </div>

      <div class="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[520px] text-left font-body text-sm">
            <thead class="border-b border-line bg-paper/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th class="whitespace-nowrap px-5 py-3">Description</th>
                <th class="whitespace-nowrap px-5 py-3 text-right">Qte</th>
                <th class="whitespace-nowrap px-5 py-3 text-right">PU HT</th>
                <th class="whitespace-nowrap px-5 py-3 text-right">TVA</th>
                <th class="whitespace-nowrap px-5 py-3 text-right">Total HT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in quote.items" :key="i" class="border-b border-line last:border-0">
                <td class="px-5 py-3">{{ item.description }}</td>
                <td class="whitespace-nowrap px-5 py-3 text-right font-mono">{{ item.quantity }}</td>
                <td class="whitespace-nowrap px-5 py-3 text-right font-mono">{{ euros(item.unitPriceCents) }} &euro;</td>
                <td class="whitespace-nowrap px-5 py-3 text-right font-mono">{{ item.vatRate }}%</td>
                <td class="whitespace-nowrap px-5 py-3 text-right font-mono tabular">{{ euros(item.quantity * item.unitPriceCents) }} &euro;</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-end p-5">
          <div class="w-full max-w-xs space-y-1.5 font-body text-sm">
            <div class="flex justify-between text-muted"><span>Sous-total HT</span><span class="font-mono tabular">{{ euros(totals(quote.items).subtotal) }} &euro;</span></div>
            <div class="flex justify-between text-muted"><span>TVA</span><span class="font-mono tabular">{{ euros(totals(quote.items).vat) }} &euro;</span></div>
            <div class="flex justify-between border-t border-line pt-1.5 font-display font-bold text-ink"><span>Total TTC</span><span class="font-mono tabular">{{ euros(totals(quote.items).total) }} &euro;</span></div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
