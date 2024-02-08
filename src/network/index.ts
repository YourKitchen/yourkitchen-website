import axios, { AxiosError } from 'axios'

const baseURLMap = {
  development: 'http://localhost:3000',
  production: 'https://koerselsliste.foersombioenergi.dk',
  test: 'https://test-koerselsliste.foersombioenergi.dk',
}

const env = process.env.NEXT_PUBLIC_ENV as 'development' | 'production' | 'test'

export interface FBResponse<T = undefined> {
  ok: boolean
  message: string
  data: T
}

export const api = axios.create({
  baseURL: `${baseURLMap[env ?? 'development']}/api/`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(undefined, async (error) => {
  if (axios.isCancel(error)) {
    return Promise.reject(error.message)
  }

  if (error instanceof AxiosError) {
    console.error(
      error.response?.data?.message ||
        error.status ||
        error.cause ||
        error.message,
    )
    return Promise.reject(
      error.response?.data?.message ||
        error.status ||
        error.cause ||
        error.message,
    )
  }

  return Promise.reject(error.message)
})
