export default defineNuxtConfig({
  compatibilityDate: '2024-08-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Reglo - Devis et factures pour indépendants',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Crée tes devis et factures en quelques minutes, envoie-les à tes clients et fais-toi payer en ligne.',
        },
        { name: 'theme-color', content: '#2A3B8F' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Reglo' },
        { property: 'og:title', content: 'Reglo - Devis et factures pour indépendants' },
        {
          property: 'og:description',
          content:
            'Crée tes devis et factures en quelques minutes, envoie-les à tes clients et fais-toi payer en ligne.',
        },
        { property: 'og:image', content: 'https://reglo.aaweb.fr/og-image.png' },
        { property: 'og:url', content: 'https://reglo.aaweb.fr' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Reglo - Devis et factures pour indépendants' },
        { name: 'twitter:image', content: 'https://reglo.aaweb.fr/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon.png' },
        { rel: 'apple-touch-icon', href: '/icon.png' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3011/api',
    },
  },
})
