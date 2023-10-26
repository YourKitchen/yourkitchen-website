export interface YKResponse<T = any> {
  ok: boolean
  message: string
  data: T
}
