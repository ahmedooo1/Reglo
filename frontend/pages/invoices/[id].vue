<script setup lang="ts">
interface InvoiceItem { description: string; quantity: number; unitPriceCents: number; vatRate: number }
interface Invoice {
  id: string
  number: string
  status: string
  publicToken: string
  isOverdue?: boolean
  client: { name: string; email?: string }
  items: InvoiceItem[]
  dueDate?: string
  notes?: string
}

const route = useRoute()
const router = useRouter()
const { request } = useApi()
const auth = useAuthStore()
const config = useRuntimeConfig()

const invoice = ref<Invoice | null>(null)
const loading = ref(true)
const linkCopied = ref(false)
const sending = ref(false)
const sendError = ref('')
const sent = ref(false)

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

async function load() {
  invoice.value = await request<Invoice>(`/invoices/${route.params.id}`, { auth: true })
}

onMounted(async () => {
  auth.restore()
  if (!auth.user) {
    router.push(`/login?redirect=/invoices/${route.params.id}`)
    return
  }
  try {
    await load()
  } finally {
    loading.value = false
  }
})

async function setStatus(status: string) {
  await request(`/invoices/${route.params.id}/status`, { method: 'PATCH', auth: true, body: { status } })
  await load()
}

function copyPublicLink() {
  if (!invoice.value) return
  const url = `${window.location.origin}/f/${invoice.value.publicToken}`
  navigator.clipboard?.writeText(url)
  linkCopied.value = true
  setTimeout(() => (linkCopied.value = false), 1500)
}

async function downloadPdf() {
  if (!invoice.value) return
  const blob = await $fetch<Blob>(`${config.public.apiBase}/invoices/${invoice.value.id}/pdf`, {
    headers: { Authorization: `Bearer ${auth.token}` },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(blob as Blob)
  window.open(url, '_blank')
}

async function sendToClient() {
  if (!invoice.value) return
  sending.value = true
  sendError.value = ''
  sent.value = false
  try {
    await request(`/invoices/${invoice.value.id}/send`, { method: 'POST', auth: true })
    sent.value = true
    await load()
  } catch (e: any) {
    sendError.value = e?.data?.message || "Impossible d'envoyer l'email."
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-14">
    <div v-if="loading" class="font-body text-muted">Chargement...</div>

    <div v-else-if="invoice">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold text-ink">Facture {{ invoice.number }}</h1>
          <p class="mt-1 font-body text-sm text-muted">{{ invoice.client.name }}</p>
        </div>
        <StatusPill :status="invoice.status" :overdue="invoice.isOverdue" />
      </div>

      <div class="mb-6 flex flex-wrap gap-3">
        <button v-if="invoice.status === 'brouillon'" class="rounded-lg bg-indigo px-4 py-2 font-body text-sm font-semibold text-white" @click="setStatus('envoyee')">
          Marquer comme envoyée
        </button>
        <button v-if="invoice.status !== 'payee'" class="rounded-lg bg-emerald px-4 py-2 font-body text-sm font-semibold text-white" @click="setStatus('payee')">
          Marquer comme payée
        </button>
        <button class="rounded-lg border border-line px-4 py-2 font-body text-sm font-medium text-ink" @click="downloadPdf">
          Télécharger le PDF
        </button>
        <button class="rounded-lg border border-line px-4 py-2 font-body text-sm font-medium text-ink" @click="copyPublicLink">
          {{ linkCopied ? 'Lien copié !' : 'Copier le lien de paiement' }}
        </button>
        <button
          v-if="invoice.client.email"
          :disabled="sending"
          class="rounded-lg border border-line px-4 py-2 font-body text-sm font-medium text-ink disabled:opacity-60"
          @click="sendToClient"
        >
          {{ sending ? 'Envoi...' : sent ? 'Email envoyé ✓' : 'Envoyer par email' }}
        </button>
        <span v-else class="self-center font-body text-xs text-muted">
          Ajoute un email au client pour pouvoir lui envoyer cette facture directement.
        </span>
      </div>
      <p v-if="sendError" class="mb-4 font-body text-sm text-rose">{{ sendError }}</p>

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
              <tr v-for="(item, i) in invoice.items" :key="i" class="border-b border-line last:border-0">
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
            <div class="flex justify-between text-muted"><span>Sous-total HT</span><span class="font-mono tabular">{{ euros(totals(invoice.items).subtotal) }} &euro;</span></div>
            <div class="flex justify-between text-muted"><span>TVA</span><span class="font-mono tabular">{{ euros(totals(invoice.items).vat) }} &euro;</span></div>
            <div class="flex justify-between border-t border-line pt-1.5 font-display font-bold text-ink"><span>Total TTC</span><span class="font-mono tabular">{{ euros(totals(invoice.items).total) }} &euro;</span></div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
