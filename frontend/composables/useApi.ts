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
    return await $fetch<T>(`${config.public.apiBase}${path}`, {
      method: (options.method as any) || 'GET',
      body: options.body as any,
      headers,
    })
  }

  return { request }
}
