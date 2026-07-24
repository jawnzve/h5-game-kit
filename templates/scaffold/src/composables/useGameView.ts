import { inject } from 'vue';
import { storeToRefs } from 'pinia';
import { usePreviewStore } from '@/stores/preview';
import { useGameStore } from '@/stores/game';

export const GAME_VIEW_MODE_KEY = Symbol('gameViewMode');

/** Preview 用 preview store；App 用 game store（④ 扩展） */
export function useGameView() {
  const mode = inject<'preview' | 'app'>(GAME_VIEW_MODE_KEY, 'app');
  if (mode === 'preview') {
    return { ...storeToRefs(usePreviewStore()), store: usePreviewStore() };
  }
  return { ...storeToRefs(useGameStore()), store: useGameStore() };
}
