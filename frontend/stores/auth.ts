import { defineStore } from 'pinia'

interface PublicUser {
  id: string
  email: string
  name: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as PublicUser | null,
  }),
  actions: {
    setSession(token: string, user: PublicUser) {
      this.token = token
      this.user = user
      if (import.meta.client) {
        localStorage.setItem('reglo_token', token)
        localStorage.setItem('reglo_user', JSON.stringify(user))
      }
    },
    restore() {
      if (import.meta.client) {
        const token = localStorage.getItem('reglo_token')
        const user = localStorage.getItem('reglo_user')
        if (token && user) {
          this.token = token
          this.user = JSON.parse(user)
        }
      }
    },
    logout() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('reglo_token')
        localStorage.removeItem('reglo_user')
      }
    },
  },
})
