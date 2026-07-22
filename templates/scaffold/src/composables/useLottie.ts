import { onBeforeUnmount } from 'vue';
import { getLottiePlayer, type LottieInitOptions } from '@/lib/ui';

export type UseLottieOptions = Omit<LottieInitOptions, 'autoplay'> & {
  /** 组件卸载时是否 destroy（默认 true；常驻 canvas 预加载实例可设 false） */
  destroyOnUnmount?: boolean;
};

/**
 * ito 项目验证过的 Lottie 用法封装：
 * - preload：loading 阶段静默加载（autoplay:false + hide）
 * - play：已加载则 show，否则 init；Vue v-if 重建 canvas 时自动 destroy 再 init
 * - hide：保留实例，仅隐藏 canvas
 */
export function useLottie(options: UseLottieOptions) {
  const instanceId = options.instanceId ?? 'default';
  const destroyOnUnmount = options.destroyOnUnmount !== false;

  function resolveCanvas(): HTMLCanvasElement | null {
    return document.getElementById(options.canvasId) as HTMLCanvasElement | null;
  }

  function baseInitOpts(autoplay: boolean): LottieInitOptions {
    return {
      instanceId,
      canvasId: options.canvasId,
      src: options.src,
      loop: options.loop,
      cdnUrl: options.cdnUrl,
      setAsDefault: options.setAsDefault,
      canvasSize: options.canvasSize,
      autoplay,
    };
  }

  async function preload(): Promise<void> {
    const canvas = resolveCanvas();
    if (!canvas) return;

    const player = getLottiePlayer();
    if (player.getInstance(instanceId)) return;

    await player.init(baseInitOpts(false));
    player.hide(instanceId);
  }

  async function play(autoplay = true): Promise<void> {
    const canvas = resolveCanvas();
    if (!canvas) {
      console.warn(`[useLottie] canvas #${options.canvasId} 不存在`);
      return;
    }

    const player = getLottiePlayer();
    const existing = player.getInstance(instanceId);

    if (existing?.instance) {
      if (existing.canvas === canvas) {
        player.show(instanceId, autoplay);
        return;
      }
      player.destroy(instanceId);
    }

    await player.init(baseInitOpts(autoplay));
  }

  function hide(): void {
    getLottiePlayer().hide(instanceId);
  }

  function destroy(): void {
    getLottiePlayer().destroy(instanceId);
  }

  if (destroyOnUnmount) {
    onBeforeUnmount(() => {
      destroy();
    });
  }

  return { preload, play, hide, destroy };
}
