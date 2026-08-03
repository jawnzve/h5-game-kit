import { computed, inject, isRef, type InjectionKey, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { usePreviewView } from '@/composables/usePreviewView';
import { PREVIEW_PERSPECTIVE_OPTIONS } from '@/lib/preview-perspectives';
import { useGameStore } from '@/stores/game';
import type { PreviewPerspective } from '@/stores/preview';

export const GAME_VIEW_MODE_KEY: InjectionKey<'preview' | 'app'> = Symbol('gameViewMode');

/** Preview 多视口：由 PreviewPhoneViewport 下传本视口视角 */
export const PREVIEW_PERSPECTIVE_KEY: InjectionKey<
  Ref<PreviewPerspective> | PreviewPerspective
> = Symbol('previewPerspective');

/** 阶段 SFC 统一用本函数取数据：Preview 走本视口视图，App 走 game store（④ 扩展） */
export function useGameView() {
  const mode = inject(GAME_VIEW_MODE_KEY, 'app');
  if (mode === 'preview') {
    const perspective = inject(PREVIEW_PERSPECTIVE_KEY, PREVIEW_PERSPECTIVE_OPTIONS[0]);
    const perspectiveRef = isRef(perspective) ? perspective : computed(() => perspective);
    return usePreviewView(perspectiveRef);
  }
  return { ...storeToRefs(useGameStore()), store: useGameStore() };
}
