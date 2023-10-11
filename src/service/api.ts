import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'
import { signOut } from '../context/auth-context'

type ResponseError = { code: string }

let isRefreshing = false
let failedRequestQueue = []

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx)

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`,
    },
  })

  api.interceptors.response.use(
    (response) => response,

    (error: AxiosError<ResponseError>) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === 'token.expired') {
          cookies = parseCookies(ctx)
          const { 'nextauth.refreshToken': refreshToken } = cookies

          const originalConfig = error.config

          if (!isRefreshing) {
            isRefreshing = true

            api
              .post('/refresh', { refreshToken })
              .then((response) => {
                const { token } = response.data

                setCookie(ctx, 'nextauth.token', token)
                api.defaults.headers.Authorization = `Bearer ${token}`

                failedRequestQueue.forEach((request) =>
                  request.onSuccess(token),
                )
                failedRequestQueue = []
              })
              .catch((error) => {
                failedRequestQueue.forEach((request) =>
                  request.onFailure(error),
                )
                failedRequestQueue = []

                if (typeof window !== 'undefined') signOut()
              })
              .finally(() => {
                isRefreshing = false
              })
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers.Authorization = `Bearer ${token}`
                resolve(api(originalConfig))
              },
              onFailure: (error: AxiosError) => {
                reject(error)
              },
            })
          })
        } else {
          if (typeof window !== 'undefined') signOut()
        }
      }
    },
  )

  return api
}

export const api = setupAPIClient()
