/** 当前服务器时间（未初始化时回退 Date.now） */
export function serverNow(): number {
  return window.ServerTimeSync?.now?.() ?? Date.now();
}

export function isServerTimeReady(): boolean {
  return Boolean(window.ServerTimeSync?.isInitialized?.());
}

/** 倒计时剩余毫秒 */
export function remainingMs(endTimestamp: number): number {
  return window.ServerTimeSync?.getRemainingTime?.(endTimestamp) ?? Math.max(0, endTimestamp - Date.now());
}

/** mm:ss */
export function formatCountdown(ms: number): string {
  return window.ServerTimeSync?.formatTime?.(ms) ?? '00:00';
}
