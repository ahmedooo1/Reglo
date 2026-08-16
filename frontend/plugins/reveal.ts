import type { DirectiveBinding } from 'vue'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// v-reveal: fades/rises an element into place the first time it enters the
// viewport. Optional arg controls the stagger delay in ms, e.g. v-reveal="120"
function mountReveal(el: HTMLElement, binding: DirectiveBinding<number | undefined>) {
  if (prefersReducedMotion()) {
    el.classList.add('is-visible')
    return
  }
  el.classList.add('reveal')
  const delay = typeof binding.value === 'number' ? binding.value : 0
  if (delay) el.style.transitionDelay = `${delay}ms`

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          io.unobserve(el)
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  )
  io.observe(el)
}

export default defineNuxtPlugin((nuxtApp) => {
  // getSSRProps is required so Vue's server renderer knows how to handle
  // this directive during SSR; the real behaviour only runs client-side.
  // (Naming this plugin *.client.ts instead would keep it off the server
  // build entirely, which breaks SSR because the directive would then be
  // completely unregistered there.)
  nuxtApp.vueApp.directive('reveal', {
    mounted: mountReveal,
    getSSRProps: () => ({}),
  })
})
