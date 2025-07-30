export interface ClientInterface {
  getCall<T>(path: string, header?: any): Promise<T>

  postCall<T, B = any>(path: string, body?: B, header?: any): Promise<T>
}
