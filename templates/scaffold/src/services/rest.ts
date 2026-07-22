/** 与 http-request.js callApi 响应对齐 */
export interface ApiResponse<T = unknown> {
  errno: number | string;
  error?: string;
  data?: T;
  /** callApi 归一化后的游戏数据（content 或 data） */
  gameData?: unknown;
}

export type HttpMethod = 'get' | 'post' | 'put' | 'delete';

export interface CallApiOptions {
  apiName?: string;
  showError?: boolean;
  onSuccess?: (response: ApiResponse) => void;
  onError?: (response: ApiResponse) => void;
  onNetworkError?: (xhr: unknown, status: string) => Error;
  loading?: { start: () => void; end: () => void } | ((loading: boolean) => void);
}

function httpRequestModule() {
  if (!window.httpRequest?.callApi) {
    throw new Error('http-request.js 未加载（检查 app-index.html script 顺序）');
  }
  return window.httpRequest;
}

/** REST 请求 — 封装 window.httpRequest.callApi，路径见 rest.md */
export function callApi<T = unknown>(
  method: HttpMethod,
  url: string,
  params?: Record<string, unknown>,
  options?: CallApiOptions
): Promise<ApiResponse<T>> {
  return httpRequestModule().callApi(
    method,
    url,
    params ?? {},
    options as Record<string, unknown> | undefined
  ) as Promise<ApiResponse<T>>;
}

export function getApi<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: CallApiOptions
): Promise<ApiResponse<T>> {
  return callApi<T>('get', url, params, options);
}

export function postApi<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: CallApiOptions
): Promise<ApiResponse<T>> {
  return callApi<T>('post', url, params, options);
}
