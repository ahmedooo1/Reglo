<script setup lang="ts">
interface DemoItem {
  description: string
  quantity: number
  unitPriceCents: number
}

const items = ref<DemoItem[]>([
  { description: 'Prestation de conseil', quantity: 2, unitPriceCents: 45000 },
  { description: "Frais de deplacement", quantity: 1, unitPriceCents: 8000 },
])

const pool: DemoItem[] = [
  { description: 'Maintenance mensuelle', quantity: 1, unitPriceCents: 12000 },
  { description: 'Formation equipe', quantity: 3, unitPriceCents: 30000 },
  { description: 'Materiel fourni', quantity: 1, unitPriceCents: 21500 },
]
let poolIndex = 0

const justAdded = ref(false)

function addLine() {
  const next = pool[poolIndex % pool.length]
  poolIndex++
  items.value = [...items.value, next]
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 500)
}

const totalCents = computed(() => {
  const subtotal = items.value.reduce((s, i) => s + i.quantity * i.unitPriceCents, 0)
  return Math.round(subtotal * 1.2)
})

function euros(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <div class="rounded-2xl border border-line bg-white p-6 shadow-card">
    <div class="mb-5 flex items-start justify-between">
      <div>
        <p class="font-display text-sm font-bold text-ink">FACTURE</p>
        <p class="font-mono text-xs text-muted">FAC-2026-0042</p>
      </div>
      <span class="rounded-full bg-amber-light px-2.5 py-1 font-body text-xs font-semibold text-amber">Envoyée</span>
    </div>

    <div class="space-y-2.5">
      <TransitionGroup name="line">
        <div v-for="(item, i) in items" :key="item.description + i" class="flex items-center justify-between text-sm">
          <span class="font-body text-ink/80">{{ item.description }} <span class="text-muted">&times;{{ item.quantity }}</span></span>
          <span class="font-mono tabular text-ink">{{ euros(item.quantity * item.unitPriceCents) }} &euro;</span>
        </div>
      </TransitionGroup>
    </div>

    <button
      type="button"
      class="focus-ring mt-4 w-full rounded-lg border border-dashed border-line py-2 font-body text-xs font-medium text-indigo transition hover:bg-indigo-light"
      @click="addLine"
    >
      + Ajouter une ligne
    </button>

    <div class="mt-5 flex items-center justify-between border-t border-line pt-4">
      <span class="font-body text-sm font-medium text-muted">Total TTC</span>
      <span
        class="font-mono text-xl font-bold tabular transition-colors"
        :class="justAdded ? 'text-emerald' : 'text-ink'"
      >
        {{ euros(totalCents) }} &euro;
      </span>
    </div>
  </div>
</template>

<style scoped>
.line-enter-active {
  transition: all 0.35s ease;
}
.line-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
