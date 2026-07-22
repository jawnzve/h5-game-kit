/** GameSync 调度选项（与 game-sync.js 一致） */
export interface GameSyncOptions {
  showLoading?: boolean;
  silent?: boolean;
}

export type SyncHandler = (options?: GameSyncOptions) => void | Promise<void>;

/** product.md § 状态同步策略 — ④ 可按文档关闭某项 */
export interface SyncTriggerConfig {
  /** 进页 / 房间就绪后 initialSync（由 ④ 在合适时机调用 triggerInitialSync） */
  initial: boolean;
  /** App 回前台 */
  foreground: boolean;
  /** 浏览器 online（断网恢复） */
  reconnect: boolean;
  /** 倒计时结束未收到 IM 的延迟兜底（需 ④ 显式 startDelayedSyncDetection） */
  delayed: boolean;
}

const DEFAULT_TRIGGERS: SyncTriggerConfig = {
  initial: true,
  foreground: true,
  reconnect: true,
  delayed: false,
};

let triggerConfig: SyncTriggerConfig = { ...DEFAULT_TRIGGERS };

function gameSync() {
  return window.GameSync;
}

export function configureSyncTriggers(partial: Partial<SyncTriggerConfig>): void {
  triggerConfig = { ...triggerConfig, ...partial };
}

export function getSyncTriggerConfig(): SyncTriggerConfig {
  return { ...triggerConfig };
}

/** ④ 注册：实际调用 rest.md 中的 sync API */
export function setSyncHandler(handler: SyncHandler): void {
  gameSync()?.setSyncHandler?.({
    handle: (options?: GameSyncOptions) => handler(options),
  });
}

export function setInitialSyncHandler(handler: () => void | Promise<void>): void {
  gameSync()?.setInitialSyncHandler?.({
    handle: () => handler(),
  });
}

/** 进页 / 房间就绪 — ④ 在 roomInfo 就绪后调用 */
export async function triggerInitialSync(): Promise<void> {
  if (!triggerConfig.initial) return;
  await gameSync()?.initialSync?.();
}

/** 回前台兜底 */
export async function triggerForegroundSync(): Promise<void> {
  if (!triggerConfig.foreground) return;
  await gameSync()?.sync?.({ showLoading: true, silent: true });
}

/** 断网恢复兜底 */
export async function triggerReconnectSync(): Promise<void> {
  if (!triggerConfig.reconnect) return;
  await gameSync()?.sync?.({ showLoading: false, silent: true });
}

/** 倒计时结束未收到 IM — product 启用 delayed 后由 ④ 调用 */
export function startDelayedSyncDetection(delayMs?: number): void {
  if (!triggerConfig.delayed) return;
  gameSync()?.startDelayedSyncDetection?.(delayMs);
}

export function stopDelayedSyncDetection(): void {
  gameSync()?.stopDelayedSyncDetection?.();
}

/** 收到 IM 后取消延迟兜底 */
export function onImReceived(): void {
  stopDelayedSyncDetection();
}

/** 手动 sync（按钮失败等场景） */
export async function triggerManualSync(options?: GameSyncOptions): Promise<void> {
  await gameSync()?.sync?.(options as Record<string, unknown> | undefined);
}
