import axios, { AxiosError } from 'axios'
import type { NextRequest } from 'next/server'

const getBaseUrl = () => {
  const map = {
    development: 'http://localhost:3000/api',
    production: 'https://yourkitchen.io/api',
    test: 'https://dev.yourkitchen.io/api',
  }
  return map[process.env.NEXT_PUBLIC_ENV as keyof typeof map]
}

export const api = axios.create({
  baseURL: getBaseUrl(), // baseURL is reloaded in request interceptor (Because we need to load the environment variables)
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
    const isJsonBlob = (data: any) =>
      data instanceof Blob && data.type === 'application/json'
    const responseData = isJsonBlob(error.response?.data)
      ? await error.response?.data?.text()
      : error.response?.data || {}

    if (typeof responseData === 'string') {
      if (!responseData.startsWith('<')) {
        // If it is not HTML
        return Promise.reject(JSON.parse(responseData)?.message)
      }
      // It is a blob that we could not parse, which means that the error code will provide the error we are looking for.
      return Promise.reject(error.message)
    }
    return Promise.reject(error.response?.data?.message || error)
  }

  return Promise.reject(error.message)
})

export const getBody = async <T = unknown>(req: NextRequest) => {
  try {
    return (await req.json()) as T
  } catch (err) {
    if (err instanceof SyntaxError) {
      // This is expected if the body does not exist or is invalid.
      return null
    }
    // Rethrow the error, to pass it on.
    throw new Error(err)
  }
}

export const getQuery = <T = unknown>(req: NextRequest) => {
  const {
    nextUrl: { search },
  } = req

  const urlSearchParams = new URLSearchParams(search)
  const params = Object.fromEntries(urlSearchParams.entries())

  return params as T
}
