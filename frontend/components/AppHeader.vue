<script setup lang="ts">
const auth = useAuthStore()
const mobileOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <NuxtLink to="/" class="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink">
        <span class="flex h-7 w-7 items-center justify-center rounded-md bg-indigo font-mono text-sm text-white">R</span>
        reglo
      </NuxtLink>

      <nav v-if="auth.user" class="hidden items-center gap-7 font-body text-sm text-muted md:flex">
        <NuxtLink to="/dashboard" class="transition hover:text-ink">Tableau de bord</NuxtLink>
        <NuxtLink to="/clients" class="transition hover:text-ink">Clients</NuxtLink>
        <NuxtLink to="/settings" class="transition hover:text-ink">Reglages</NuxtLink>
      </nav>

      <div class="hidden items-center gap-3 md:flex">
        <template v-if="auth.user">
          <NuxtLink
            to="/quotes/new"
            class="rounded-lg bg-indigo px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-dark"
          >
            + Nouveau devis
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="text-sm text-muted transition hover:text-ink">Connexion</NuxtLink>
          <NuxtLink
            to="/register"
            class="rounded-lg bg-indigo px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-dark"
          >
            Essayer gratuitement
          </NuxtLink>
        </template>
      </div>

      <button class="text-ink md:hidden" aria-label="Menu" @click="mobileOpen = !mobileOpen">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div v-if="mobileOpen" class="border-t border-line px-6 py-4 md:hidden">
      <div class="flex flex-col gap-4 font-body text-sm text-muted">
        <template v-if="auth.user">
          <NuxtLink to="/dashboard" @click="mobileOpen = false">Tableau de bord</NuxtLink>
          <NuxtLink to="/clients" @click="mobileOpen = false">Clients</NuxtLink>
          <NuxtLink to="/settings" @click="mobileOpen = false">Reglages</NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" @click="mobileOpen = false">Connexion</NuxtLink>
          <NuxtLink to="/register" @click="mobileOpen = false">Essayer gratuitement</NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>
