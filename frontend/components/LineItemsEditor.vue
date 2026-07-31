<script setup lang="ts">
interface Item {
  description: string
  quantity: number
  unitPriceCents: number
  vatRate: number
}

const props = defineProps<{ modelValue: Item[] }>()
const emit = defineEmits<{ 'update:modelValue': [Item[]] }>()

const items = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function addItem() {
  items.value = [...items.value, { description: '', quantity: 1, unitPriceCents: 0, vatRate: 20 }]
}

function removeItem(index: number) {
  items.value = items.value.filter((_, i) => i !== index)
}

function updateField(index: number, field: keyof Item, value: string) {
  const next = [...items.value]
  const item = { ...next[index] }
  if (field === 'description') item.description = value
  else if (field === 'quantity') item.quantity = Number(value) || 0
  else if (field === 'unitPriceCents') item.unitPriceCents = Math.round(Number(value) * 100) || 0
  else if (field === 'vatRate') item.vatRate = Number(value) || 0
  next[index] = item
  items.value = next
}

const totals = computed(() => {
  let subtotal = 0
  let vat = 0
  for (const item of items.value) {
    const lineTotal = item.quantity * item.unitPriceCents
    subtotal += lineTotal
    vat += Math.round((lineTotal * item.vatRate) / 100)
  }
  return { subtotal, vat, total: subtotal + vat }
})

function euros(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(() => {
  if (!items.value.length) addItem()
})
</script>

<template>
  <div>
    <div class="hidden grid-cols-[1fr_70px_100px_80px_110px_36px] gap-3 border-b border-line pb-2 font-body text-xs font-medium uppercase tracking-wide text-muted md:grid">
      <span>Description</span>
      <span class="text-right">Qte</span>
      <span class="text-right">PU HT</span>
      <span class="text-right">TVA</span>
      <span class="text-right">Total HT</span>
      <span />
    </div>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="grid grid-cols-1 gap-2 border-b border-line py-3 md:grid-cols-[1fr_70px_100px_80px_110px_36px] md:items-center md:gap-3"
    >
      <input
        :value="item.description"
        type="text"
        placeholder="Prestation, produit..."
        class="focus-ring rounded-lg border border-line bg-white px-3 py-2 font-body text-sm text-ink"
        @input="updateField(index, 'description', ($event.target as HTMLInputElement).value)"
      />
      <input
        :value="item.quantity"
        type="number"
        min="0"
        step="1"
        class="focus-ring rounded-lg border border-line bg-white px-3 py-2 text-right font-mono text-sm text-ink"
        @input="updateField(index, 'quantity', ($event.target as HTMLInputElement).value)"
      />
      <input
        :value="(item.unitPriceCents / 100).toFixed(2)"
        type="number"
        min="0"
        step="0.01"
        class="focus-ring rounded-lg border border-line bg-white px-3 py-2 text-right font-mono text-sm text-ink"
        @input="updateField(index, 'unitPriceCents', ($event.target as HTMLInputElement).value)"
      />
      <select
        :value="item.vatRate"
        class="focus-ring rounded-lg border border-line bg-white px-2 py-2 text-right font-mono text-sm text-ink"
        @change="updateField(index, 'vatRate', ($event.target as HTMLSelectElement).value)"
      >
        <option :value="0">0%</option>
        <option :value="5.5">5,5%</option>
        <option :value="10">10%</option>
        <option :value="20">20%</option>
      </select>
      <span class="text-right font-mono text-sm tabular text-ink">
        {{ euros(item.quantity * item.unitPriceCents) }} &euro;
      </span>
      <button
        type="button"
        class="focus-ring justify-self-end text-muted transition hover:text-rose"
        aria-label="Supprimer la ligne"
        @click="removeItem(index)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <button
      type="button"
      class="focus-ring mt-3 rounded-lg border border-dashed border-line px-4 py-2 font-body text-sm font-medium text-indigo transition hover:bg-indigo-light"
      @click="addItem"
    >
      + Ajouter une ligne
    </button>

    <div class="mt-6 flex justify-end">
      <div class="w-full max-w-xs space-y-1.5 font-body text-sm">
        <div class="flex justify-between text-muted">
          <span>Sous-total HT</span>
          <span class="font-mono tabular text-ink">{{ euros(totals.subtotal) }} &euro;</span>
        </div>
        <div class="flex justify-between text-muted">
          <span>TVA</span>
          <span class="font-mono tabular text-ink">{{ euros(totals.vat) }} &euro;</span>
        </div>
        <div class="flex justify-between border-t border-line pt-1.5 font-display text-base font-bold text-ink">
          <span>Total TTC</span>
          <span class="font-mono tabular">{{ euros(totals.total) }} &euro;</span>
        </div>
      </div>
    </div>
  </div>
</template>
