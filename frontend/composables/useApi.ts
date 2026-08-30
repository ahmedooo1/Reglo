export function useApi() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  async function request<T>(
    path: string,
    options: { method?: string; body?: unknown; auth?: boolean } = {},
  ): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (options.auth && auth.token) {
      headers.Authorization = `Bearer ${auth.token}`
    }
    try {
      return await $fetch<T>(`${config.public.apiBase}${path}`, {
        method: (options.method as any) || 'GET',
        body: options.body as any,
        headers,
      })
    } catch (e: any) {
      // An expired/invalid token on an authenticated call must not fail
      // silently -- the previous behavior left pages looking logged-in
      // while every request quietly 401'd (e.g. an empty client list that
      // wasn't actually empty). Force a clean re-login instead.
      if (options.auth && e?.response?.status === 401) {
        auth.logout()
        const router = useRouter()
        router.push(`/login?redirect=${encodeURIComponent(useRoute().fullPath)}`)
      }
      throw e
    }
  }

  return { request }
}
