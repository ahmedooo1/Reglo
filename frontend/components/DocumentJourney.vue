<script setup lang="ts">
// Signature section: instead of illustrating "the same document survives its
// whole lifecycle" with a screenshot + separate step cards, the page enacts
// it -- one pinned invoice visually mutates through each state as the user
// scrolls past the matching beat of copy, then renumbers itself from DEV- to
// FAC- exactly like the real conversion in users.service.ts does.
type LifecycleState = 'brouillon' | 'envoye' | 'accepte' | 'paye'

const beats: { state: LifecycleState; status: string; title: string; text: string }[] = [
  { state: 'brouillon', status: 'Brouillon', title: 'Tu crées le devis', text: 'Lignes, TVA multi-taux, totaux calculés automatiquement.' },
  { state: 'envoye', status: 'Envoyé', title: 'Ton client le reçoit', text: 'Un lien public, sans compte à créer de son côté.' },
  { state: 'accepte', status: 'Accepté', title: 'Il accepte en ligne', text: 'Signature électronique du devis, converti en facture en un clic.' },
  { state: 'paye', status: 'Payé', title: 'Tu encaisses', text: 'Paiement Stripe intégré à la facture, retards détectés automatiquement.' },
]

const currentState = ref<LifecycleState>('brouillon')
const beatEls = ref<HTMLElement[]>([])
const planeKey = ref(0)

const docNumber = computed(() => (currentState.value === 'paye' ? 'FAC-2026-0182' : 'DEV-2026-0182'))
const filled = computed(() => currentState.value !== 'brouillon')
const signed = computed(() => currentState.value === 'accepte' || currentState.value === 'paye')
const paid = computed(() => currentState.value === 'paye')

const badgeClass = computed(() => ({
  'bg-line text-muted': currentState.value === 'brouillon',
  'bg-amber-light text-amber': currentState.value === 'envoye',
  'bg-indigo-light text-indigo': currentState.value === 'accepte',
  'bg-emerald-light text-emerald': currentState.value === 'paye',
}))

function setState(next: LifecycleState) {
  if (next === currentState.value) return
  const wasBrouillon = currentState.value === 'brouillon'
  currentState.value = next
  if (wasBrouillon && next === 'envoye') planeKey.value++
}

let observer: IntersectionObserver | undefined

onMounted(() => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const state = (entry.target as HTMLElement).dataset.state as LifecycleState
          setState(state)
        }
      }
    },
    { threshold: 0, rootMargin: '-45% 0px -45% 0px' },
  )
  beatEls.value.forEach((el) => observer!.observe(el))
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="flex flex-col gap-0 lg:flex-row lg:items-start lg:gap-14">
    <div class="mx-auto w-full max-w-[280px] lg:sticky lg:top-[88px] lg:mx-0 lg:max-w-[320px]">
      <p class="mb-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        Document&nbsp;: <b class="text-ink">{{ beats.find(b => b.state === currentState)?.status }}</b>
      </p>

      <div class="relative rounded-lg border border-line bg-white p-5 pb-[18px]">
        <span :key="planeKey" class="doc-plane pointer-events-none absolute left-[14%] top-[38%] text-amber">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2 12l19-9-7 19-3-8-9-2z" /></svg>
        </span>

        <div class="flex items-start justify-between">
          <div>
            <p class="font-display text-[13px] font-bold text-ink">REGLO</p>
            <p class="mt-0.5 font-mono text-xs transition-colors" :class="paid ? 'text-emerald' : 'text-muted'">{{ docNumber }}</p>
          </div>
          <span class="rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase transition-colors" :class="badgeClass">
            {{ beats.find(b => b.state === currentState)?.status }}
          </span>
        </div>

        <p class="mt-4 text-sm font-semibold text-ink">Menuiserie Lefebvre</p>

        <div class="mt-3.5 flex flex-col gap-2.5">
          <div class="flex items-center justify-between gap-2.5 text-sm">
            <span class="doc-bar h-2 max-w-[150px] flex-1 rounded-sm bg-line">
              <span class="block h-full rounded-sm bg-muted/40 transition-all duration-500" :class="filled ? 'w-full' : 'w-0'" />
            </span>
            <span class="w-16 flex-shrink-0 text-right font-mono tabular transition-opacity duration-500" :class="filled ? 'opacity-100' : 'opacity-0'">960,00 €</span>
          </div>
          <div class="flex items-center justify-between gap-2.5 text-sm">
            <span class="doc-bar h-2 max-w-[150px] flex-1 rounded-sm bg-line">
              <span class="block h-full rounded-sm bg-muted/40 transition-all duration-500" :class="filled ? 'w-full' : 'w-0'" />
            </span>
            <span class="flex w-16 flex-shrink-0 items-center justify-end gap-0.5 text-right font-mono tabular transition-opacity duration-500" :class="filled ? 'opacity-100' : 'opacity-0'">
              240,00 €
              <span v-if="!filled" class="doc-cursor" aria-hidden="true" />
            </span>
          </div>
        </div>

        <div class="relative mt-4 h-11 border-t border-dashed border-line pt-3.5">
          <svg width="140" height="40" viewBox="0 0 140 40" class="absolute -top-0.5 left-0">
            <path
              d="M4 30 C 20 8, 32 8, 40 26 C 46 38, 56 14, 68 26 C 78 36, 84 16, 96 26 C 104 33, 112 26, 120 26"
              fill="none" stroke="#2A3B8F" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
              class="doc-signature" :class="{ 'doc-signature--drawn': signed }"
            />
          </svg>
          <span class="absolute -bottom-1 left-0 font-mono text-[10px] text-muted">Signature électronique</span>
        </div>

        <div class="mt-4 flex items-baseline justify-between border-t border-line pt-3.5">
          <span class="text-sm text-muted">Total TTC</span>
          <span class="font-mono font-bold tabular transition-all duration-300" :class="paid ? 'text-xl text-emerald' : 'text-lg text-ink'">1 440,00 €</span>
        </div>

        <span
          class="absolute -right-3.5 -top-4 flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full border-2 border-dashed border-emerald bg-paper text-center font-mono text-[9px] font-bold uppercase leading-tight text-emerald transition-transform duration-500"
          :class="paid ? 'scale-100 -rotate-12' : 'scale-0 -rotate-[18deg]'"
        >
          Payé<br />&#10003;
        </span>
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <div
        v-for="(beat, i) in beats"
        :key="beat.state"
        :ref="(el) => { if (el) beatEls[i] = el as HTMLElement }"
        :data-state="beat.state"
        class="flex min-h-[64vh] flex-col justify-center py-[6vh] transition-opacity duration-300 last:min-h-[50vh]"
        :class="currentState === beat.state ? 'opacity-100' : 'opacity-40'"
      >
        <span class="font-mono text-xs uppercase tracking-[0.12em] text-indigo">{{ beat.status }}</span>
        <h3 class="mt-3 max-w-[420px] font-display text-2xl font-bold text-ink md:text-3xl">{{ beat.title }}</h3>
        <p class="mt-3 max-w-[400px] font-body leading-relaxed text-muted">{{ beat.text }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.doc-cursor {
  display: inline-block;
  width: 2px;
  height: 12px;
  margin-left: 2px;
  background: #14171F;
  animation: doc-blink 1s step-end infinite;
}
@keyframes doc-blink {
  50% { opacity: 0; }
}

.doc-signature {
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  transition: stroke-dashoffset 0.9s cubic-bezier(.3, .7, .2, 1);
}
.doc-signature--drawn {
  stroke-dashoffset: 0;
}

.doc-plane {
  opacity: 0;
  animation: doc-fly 0.9s ease forwards;
}
@keyframes doc-fly {
  0% { opacity: 0; transform: translate(0, 0) rotate(0deg) scale(0.7); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translate(220px, -46px) rotate(18deg) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .doc-plane { animation: none; opacity: 0; }
  .doc-cursor { animation: none; }
}
</style>
