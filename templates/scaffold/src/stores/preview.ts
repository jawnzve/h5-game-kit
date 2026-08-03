import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { PREVIEW_PERSPECTIVE_OPTIONS } from '@/lib/preview-perspectives';
import { sliceMockPlayers, type PreviewMockPlayer } from '@/mock/players';
import { ALL_STAGES, STAGE_LABELS, type StageId } from '@/types/game';

/** ② 收敛为具体联合类型，如 `'mayor' | 'player' | 'spectator'` */
export type PreviewPerspective = string;

export interface PreviewViewportSlot {
  id: string;
  perspective: PreviewPerspective;
}

/**
 * 每视口独立状态 —— 同一局里「只有本人看得到」的部分。
 * ② 按 product.md 视角矩阵扩展（如本人选择、身份是否已翻开、输入框文本）。
 */
export interface PreviewPerViewState {
  revealed: boolean;
  selectedId: string | null;
}

function defaultPerViewState(): PreviewPerViewState {
  return { revealed: false, selectedId: null };
}

let viewportSeq = 0;

function createViewportSlot(perspective: PreviewPerspective): PreviewViewportSlot {
  viewportSeq += 1;
  return { id: `vp-${viewportSeq}`, perspective };
}

/** Preview 专用 —— 全局局状态（所有视口共享）+ 多视口槽位（各自视角） */
export const usePreviewStore = defineStore('preview', () => {
  const currentStage = ref<StageId>('ready');

  /** 默认为每个视角开一个并排视口 */
  const viewports = ref<PreviewViewportSlot[]>(
    PREVIEW_PERSPECTIVE_OPTIONS.map(createViewportSlot)
  );

  const perViewState = ref<Record<string, PreviewPerViewState>>({});

  const mockPlayerCount = ref(4);
  const players = ref<PreviewMockPlayer[]>(sliceMockPlayers(mockPlayerCount.value));

  /** 手机视口尺寸（默认 iPhone 12 Pro）；由 PreviewDevicePanel 切换 */
  const previewPhoneWidth = ref(390);
  const previewPhoneHeight = ref(844);

  const stageTitle = computed(
    () => STAGE_LABELS[currentStage.value] ?? currentStage.value
  );

  const stages = ALL_STAGES;

  watch(mockPlayerCount, (n) => {
    players.value = sliceMockPlayers(n);
  });

  function ensureViewState(perspective: PreviewPerspective): PreviewPerViewState {
    if (!perViewState.value[perspective]) {
      perViewState.value[perspective] = defaultPerViewState();
    }
    return perViewState.value[perspective];
  }

  function resetAllViewState() {
    perViewState.value = {};
  }

  function addViewport(perspective: PreviewPerspective = PREVIEW_PERSPECTIVE_OPTIONS[0]) {
    viewports.value.push(createViewportSlot(perspective));
  }

  function removeViewport(id: string) {
    if (viewports.value.length <= 1) return;
    viewports.value = viewports.value.filter((v) => v.id !== id);
  }

  function moveViewport(id: string, delta: -1 | 1) {
    const list = viewports.value;
    const i = list.findIndex((v) => v.id === id);
    if (i < 0) return;
    const j = i + delta;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    viewports.value = next;
  }

  function setViewportPerspective(id: string, perspective: PreviewPerspective) {
    const slot = viewports.value.find((v) => v.id === id);
    if (slot) slot.perspective = perspective;
  }

  return {
    currentStage,
    stages,
    stageTitle,
    viewports,
    perViewState,
    mockPlayerCount,
    players,
    previewPhoneWidth,
    previewPhoneHeight,
    ensureViewState,
    resetAllViewState,
    addViewport,
    removeViewport,
    moveViewport,
    setViewportPerspective,
  };
});
