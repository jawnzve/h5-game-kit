/** Toast — 与 http-request.handleApiResponse 的 showToast 对齐 */
export function toast(message: string, type = 'info', duration = 2000): void {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type, duration);
    return;
  }
  console.warn('[ui] showToast:', message);
}

/** 模态警告框 */
export function alertDialog(
  title: string,
  message: string,
  buttons: string[] = ['确定'],
  callback?: (label: string, index: number) => void
): void {
  window.showAlert?.(title, message, buttons, callback);
}

export function showGlobalLoading(): void {
  window.showLoading?.();
}

export function hideGlobalLoading(): void {
  window.hideLoading?.();
}

/** 供 http-request.callApi({ loading: apiLoadingAdapter }) 使用 */
export const apiLoadingAdapter = {
  start: () => showGlobalLoading(),
  end: () => hideGlobalLoading(),
};

/** 命令式输入框（② 可 mount 到 DOM 节点；Vue 表单也可用原生 input） */
export function createInputField(options: Record<string, unknown>): InputFieldHandle {
  if (!window.createInputField) {
    throw new Error('web-input.js 未加载');
  }
  return window.createInputField(options);
}

export function validateInputLength(
  inputOrField: InputFieldHandle | HTMLInputElement,
  maxLength = 15
) {
  return window.validateInputLength?.(inputOrField, maxLength);
}

export interface LottieCanvasSize {
  width: number;
  height: number;
}

export interface LottieInitOptions {
  instanceId?: string;
  canvasId: string;
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  cdnUrl?: string;
  setAsDefault?: boolean;
  /** 内联小动画（如 thinking）须固定尺寸，避免 WebAssembly buffer 与屏幕自适应冲突 */
  canvasSize?: LottieCanvasSize;
}

/** 默认全屏 canvas id（见 LottieCanvas.vue） */
export const DEFAULT_LOTTIE_CANVAS_ID = 'game-lottie-canvas';

export function getLottiePlayer(): LottiePlayerModule {
  if (!window.LottiePlayer) {
    throw new Error('web-lottie.js 未加载');
  }
  return window.LottiePlayer;
}

export function getLottieInstance(instanceId = 'default') {
  return getLottiePlayer().getInstance(instanceId);
}

/** 初始化 Lottie；动画文件放 public/assets/anim/*.lottie */
export function initLottie(options: LottieInitOptions): Promise<unknown> {
  return getLottiePlayer().init(options);
}

/** loading 阶段预加载：init(autoplay:false) + hide，ito 验证模式 */
export async function preloadLottie(options: Omit<LottieInitOptions, 'autoplay'>): Promise<void> {
  const instanceId = options.instanceId ?? 'default';
  const player = getLottiePlayer();
  if (player.getInstance(instanceId)) return;
  if (!document.getElementById(options.canvasId)) return;
  await player.init({ ...options, autoplay: false });
  player.hide(instanceId);
}

/** 已加载则 show 复用；否则 init。Vue v-if 导致 canvas 换节点时会 destroy 再 init */
export async function playLottie(options: LottieInitOptions): Promise<void> {
  const instanceId = options.instanceId ?? 'default';
  const canvas = document.getElementById(options.canvasId);
  if (!canvas) {
    console.warn(`[ui] playLottie: canvas #${options.canvasId} 不存在`);
    return;
  }

  const player = getLottiePlayer();
  const existing = player.getInstance(instanceId);
  const autoplay = options.autoplay !== false;

  if (existing?.instance) {
    if (existing.canvas === canvas) {
      player.show(instanceId, autoplay);
      return;
    }
    player.destroy(instanceId);
  }

  await player.init(options);
}

export function showLottie(instanceId = 'default', autoplay = true): void {
  getLottiePlayer().show(instanceId, autoplay);
}

export function hideLottie(instanceId = 'default'): void {
  getLottiePlayer().hide(instanceId);
}

export function playLottieInstance(instanceId = 'default'): void {
  getLottiePlayer().play(instanceId);
}

export function stopLottie(instanceId = 'default'): void {
  getLottiePlayer().stop(instanceId);
}

export function destroyLottie(instanceId = 'default'): void {
  getLottiePlayer().destroy(instanceId);
}

export function destroyAllLottie(): void {
  getLottiePlayer().destroyAll();
}
