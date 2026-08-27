<script setup lang="ts">
const props = defineProps<{ status: string; overdue?: boolean }>()

const map: Record<string, { label: string; classes: string }> = {
  brouillon: { label: 'Brouillon', classes: 'bg-line/60 text-muted' },
  envoye: { label: 'Envoyé', classes: 'bg-amber-light text-amber' },
  envoyee: { label: 'Envoyée', classes: 'bg-amber-light text-amber' },
  accepte: { label: 'Accepté', classes: 'bg-emerald-light text-emerald' },
  payee: { label: 'Payée', classes: 'bg-emerald-light text-emerald' },
  refuse: { label: 'Refusé', classes: 'bg-rose-light text-rose' },
}

const computedStatus = computed(() =>
  props.overdue ? { label: 'En retard', classes: 'bg-rose-light text-rose' } : map[props.status] || map.brouillon,
)
</script>

<template>
  <span class="inline-flex items-center rounded-full px-2.5 py-1 font-body text-xs font-semibold" :class="computedStatus.classes">
    {{ computedStatus.label }}
  </span>
</template>
