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

/** MM:SS */
export function formatCountdown(ms: number): string {
  if (window.ServerTimeSync?.formatTime) {
    return window.ServerTimeSync.formatTime(ms);
  }
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
