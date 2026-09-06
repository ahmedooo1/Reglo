<script setup lang="ts">
const emit = defineEmits<{
  success: [session: { accessToken: string; user: any }]
  error: [message: string]
}>()

const { request } = useApi()
const config = useRuntimeConfig()
const el = ref<HTMLElement | null>(null)

declare global {
  interface Window {
    google?: any
  }
}

async function handleCredential(response: { credential: string }) {
  try {
    const session = await request<{ accessToken: string; user: any }>('/auth/google', {
      method: 'POST',
      body: { idToken: response.credential },
    })
    emit('success', session)
  } catch {
    emit('error', 'La connexion Google a echoue. Reessaie.')
  }
}

function render() {
  if (!window.google?.accounts?.id || !el.value || !config.public.googleClientId) return
  window.google.accounts.id.initialize({
    client_id: config.public.googleClientId,
    callback: handleCredential,
  })
  window.google.accounts.id.renderButton(el.value, {
    theme: 'filled_black',
    size: 'large',
    width: 320,
    text: 'continue_with',
  })
}

onMounted(() => {
  if (window.google?.accounts?.id) {
    render()
    return
  }
  // The GIS script is loaded async - poll briefly until it's ready.
  const iv = setInterval(() => {
    if (window.google?.accounts?.id) {
      clearInterval(iv)
      render()
    }
  }, 100)
  setTimeout(() => clearInterval(iv), 10000)
})
</script>

<template>
  <div ref="el"></div>
</template>
