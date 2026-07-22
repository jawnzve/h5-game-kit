/** 埋点 — 封装 window.trackLog，事件名不含 game_ 前缀 */
export function trackLog(action: string, message: Record<string, unknown> = {}): void {
  if (typeof window.trackLog !== 'function') {
    console.warn('[track] track-log.js 未加载');
    return;
  }
  window.trackLog(action, message);
}

/** 示例：trackLog('stage_enter', { stage: 'ready', roomId: 123 }) */
