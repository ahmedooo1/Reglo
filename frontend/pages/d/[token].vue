<script setup lang="ts">
interface QuoteItem { description: string; quantity: number; unitPriceCents: number; vatRate: number }
interface PublicQuote {
  number: string
  status: string
  client: { name: string }
  items: QuoteItem[]
  validUntil?: string
  notes?: string
}

const route = useRoute()
const { request } = useApi()
const config = useRuntimeConfig()

const quote = ref<PublicQuote | null>(null)
const loading = ref(true)
const notFound = ref(false)
const responding = ref(false)
const responded = ref(false)
const acceptName = ref('')
const acceptConsent = ref(false)
const acceptError = ref('')
const acceptedAsName = ref('')

const canAccept = computed(() => acceptName.value.trim().length > 0 && acceptConsent.value)

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

onMounted(async () => {
  try {
    quote.value = await request<PublicQuote>(`/quotes/public/${route.params.token}`)
  } catch (e) {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

async function respond(status: 'accepte' | 'refuse') {
  responding.value = true
  acceptError.value = ''
  try {
    const body: Record<string, unknown> = { status }
    if (status === 'accepte') {
      body.name = acceptName.value.trim()
      body.consent = acceptConsent.value
    }
    await request(`/quotes/public/${route.params.token}/status`, { method: 'PATCH', body })
    if (quote.value) quote.value.status = status
    if (status === 'accepte') acceptedAsName.value = acceptName.value.trim()
    responded.value = true
  } catch (e: any) {
    acceptError.value = e?.data?.message || "Une erreur est survenue, merci de réessayer."
  } finally {
    responding.value = false
  }
}

function downloadPdf() {
  window.open(`${config.public.apiBase}/quotes/public/${route.params.token}/pdf`, '_blank')
}
</script>

<template>
  <main class="mx-auto max-w-2xl px-6 py-14">
    <div v-if="loading" class="font-body text-muted">Chargement du devis...</div>

    <div v-else-if="notFound" class="rounded-2xl border border-line bg-white p-10 text-center shadow-card">
      <p class="font-body text-ink">Ce devis n'existe plus.</p>
    </div>

    <div v-else-if="quote" class="rounded-2xl border border-line bg-white p-8 shadow-card">
      <div class="mb-6 flex items-start justify-between">
        <div>
          <p class="font-display text-xl font-bold text-ink">Devis {{ quote.number }}</p>
          <p class="mt-1 font-body text-sm text-muted">Pour {{ quote.client.name }}</p>
        </div>
        <StatusPill :status="quote.status" />
      </div>

      <div class="space-y-2.5 border-t border-line pt-5">
        <div v-for="(item, i) in quote.items" :key="i" class="flex justify-between font-body text-sm">
          <span class="text-ink/80">{{ item.description }} &times;{{ item.quantity }}</span>
          <span class="font-mono tabular text-ink">{{ euros(item.quantity * item.unitPriceCents) }} &euro;</span>
        </div>
      </div>

      <div class="mt-5 flex justify-between border-t border-line pt-4 font-display text-lg font-bold text-ink">
        <span>Total TTC</span>
        <span class="font-mono tabular">{{ euros(totals(quote.items).total) }} &euro;</span>
      </div>

      <p v-if="quote.notes" class="mt-4 font-body text-sm text-muted">{{ quote.notes }}</p>

      <div v-if="quote.status === 'envoye' && !responded" class="mt-8 border-t border-line pt-6">
        <label class="block">
          <span class="font-body text-xs font-medium uppercase tracking-wide text-muted">Votre nom complet</span>
          <input
            v-model="acceptName"
            type="text"
            maxlength="200"
            placeholder="Prénom Nom"
            class="focus-ring mt-2 w-full max-w-sm rounded-lg border border-line bg-white px-4 py-2.5 font-body text-sm text-ink outline-none"
          />
        </label>
        <label class="mt-3 flex items-start gap-2.5 font-body text-sm text-ink">
          <input v-model="acceptConsent" type="checkbox" class="focus-ring mt-0.5 h-4 w-4 rounded border-line" />
          <span>J'ai pris connaissance de ce devis et j'en accepte les termes.</span>
        </label>
        <p v-if="acceptError" class="mt-3 font-body text-sm text-rose">{{ acceptError }}</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <button :disabled="responding || !canAccept" class="rounded-lg bg-emerald px-5 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-60" @click="respond('accepte')">
            Accepter le devis
          </button>
          <button :disabled="responding" class="rounded-lg border border-line px-5 py-2.5 font-body text-sm font-medium text-ink disabled:opacity-60" @click="respond('refuse')">
            Refuser
          </button>
        </div>
      </div>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <p v-if="quote.status === 'accepte'" class="font-body text-sm font-medium text-emerald">
          Devis accepté{{ acceptedAsName ? ` par ${acceptedAsName}` : '' }}, merci !
        </p>
        <p v-else-if="quote.status === 'refuse'" class="font-body text-sm font-medium text-muted">Devis refusé.</p>
        <button class="rounded-lg border border-line px-5 py-2.5 font-body text-sm font-medium text-ink" @click="downloadPdf">
          Télécharger le PDF
        </button>
      </div>
    </div>
  </main>
</template>
