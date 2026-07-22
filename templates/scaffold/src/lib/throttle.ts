/** 按钮/API 防抖 — 封装 ThrottleUtil（与 aeroplane-chess 一致） */
export function throttleApiCall(key: string, intervalMs = 800): boolean {
  if (window.ThrottleUtil?.throttleApiCall) {
    return window.ThrottleUtil.throttleApiCall(key, intervalMs);
  }
  return true;
}

export const THROTTLE_DEFAULT_MS = 800;
