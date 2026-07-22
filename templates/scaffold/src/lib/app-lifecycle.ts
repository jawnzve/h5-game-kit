import { onAIGameDevice, onDidEnterBackground, onWillEnterForeground } from '@/bridge';
import { triggerForegroundSync, triggerReconnectSync } from '@/lib/game-sync';

/**
 * App 生命周期：时间校准 + 通用 sync 时机（进页 initial 由 ④ triggerInitialSync）
 */
export function initAppLifecycle(): void {
  onAIGameDevice((data) => {
    const payload = data as { timestamp?: number };
    if (payload?.timestamp && window.ServerTimeSync) {
      window.ServerTimeSync.initialize(payload.timestamp);
    }
  });

  onDidEnterBackground(() => {
    if (window.ServerTimeSync?.isInitialized?.()) {
      window.ServerTimeSync.stopTimer();
    }
  });

  onWillEnterForeground(() => {
    if (window.ServerTimeSync?.isInitialized?.()) {
      window.ServerTimeSync.calibrate();
    }
    void triggerForegroundSync();
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      void triggerReconnectSync();
    });
  }
}
