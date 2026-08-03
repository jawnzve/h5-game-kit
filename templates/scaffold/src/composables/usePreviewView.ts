import { computed, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { resolvePreviewMockUserId } from '@/lib/preview-perspectives';
import {
  usePreviewStore,
  type PreviewPerViewState,
  type PreviewPerspective,
} from '@/stores/preview';

/**
 * 单个 Preview 视口的数据视图：共享全局局状态 + 本视角独立状态。
 * ② 按 product.md 视角矩阵在此派生「本视角可见 / 可操作」的 computed。
 */
export function usePreviewView(perspective: Ref<PreviewPerspective> | PreviewPerspective) {
  const store = usePreviewStore();
  const p = typeof perspective === 'string' ? computed(() => perspective) : perspective;

  const { currentStage, players, mockPlayerCount, previewPhoneWidth, previewPhoneHeight } =
    storeToRefs(store);

  const mockUserId = computed(() => resolvePreviewMockUserId(p.value));

  const viewState = computed<PreviewPerViewState>(() => store.ensureViewState(p.value));

  const revealed = computed({
    get: () => viewState.value.revealed,
    set: (v: boolean) => {
      store.ensureViewState(p.value).revealed = v;
    },
  });

  const selectedId = computed({
    get: () => viewState.value.selectedId,
    set: (v: string | null) => {
      store.ensureViewState(p.value).selectedId = v;
    },
  });

  /** 切换视角 / 阶段时同步本视口的默认状态；② 按 product 实现 */
  function applyPerspectivePreset() {
    /* h5-game-preview */
  }

  return {
    currentStage,
    perspective: p,
    mockUserId,
    players,
    mockPlayerCount,
    previewPhoneWidth,
    previewPhoneHeight,
    viewState,
    revealed,
    selectedId,
    applyPerspectivePreset,
    store,
  };
}
