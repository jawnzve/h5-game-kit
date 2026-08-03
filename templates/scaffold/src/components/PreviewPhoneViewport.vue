<script setup lang="ts">
/**
 * 单个 Preview 手机视口：顶部视角选择与排序按钮 + 内部游戏壳。
 * 每个视口独立 provide 视角与 toast 挂载根，可并排对比多视角。
 */
import { computed, provide, ref, toRef, watch } from 'vue';
import GameShell from '@/components/GameShell.vue';
import LottieCanvas from '@/components/LottieCanvas.vue';
import { GAME_VIEW_MODE_KEY, PREVIEW_PERSPECTIVE_KEY } from '@/composables/useGameView';
import { usePreviewView } from '@/composables/usePreviewView';
import {
  labelForPreviewPerspective,
  PREVIEW_PERSPECTIVE_OPTIONS,
} from '@/lib/preview-perspectives';
import { TOAST_ROOT_KEY } from '@/lib/ui';
import type { PreviewPerspective } from '@/stores/preview';

const props = defineProps<{
  viewportId: string;
  perspective: PreviewPerspective;
  phoneStyle: Record<string, string>;
  currentStage: string;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  /** 首个视口保留固定 testid，供 E2E / smoke 定位 */
  primary?: boolean;
}>();

const emit = defineEmits<{
  'update:perspective': [PreviewPerspective];
  remove: [];
  'move-left': [];
  'move-right': [];
}>();

const perspectiveRef = toRef(props, 'perspective');

provide(GAME_VIEW_MODE_KEY, 'preview');
provide(PREVIEW_PERSPECTIVE_KEY, perspectiveRef);

const phoneRef = ref<HTMLElement | null>(null);
provide(TOAST_ROOT_KEY, phoneRef);

const { applyPerspectivePreset } = usePreviewView(perspectiveRef);
watch(perspectiveRef, () => applyPerspectivePreset(), { immediate: true });

const perspectiveLabel = computed(() => labelForPreviewPerspective(props.perspective));

const wrapStyle = computed(() => ({ width: props.phoneStyle.width }));

function onPerspectiveChange(e: Event) {
  emit('update:perspective', (e.target as HTMLSelectElement).value);
}
</script>

<template>
  <div
    class="preview-viewport-wrap"
    :style="wrapStyle"
    :data-testid="primary ? 'preview-phone-viewport' : `preview-viewport-${viewportId}`"
    :data-perspective="perspective"
  >
    <div class="viewport-header">
      <div class="viewport-header-start">
        <label class="viewport-perspective-picker">
          <span class="viewport-perspective-label">{{ perspectiveLabel }}</span>
          <select
            class="viewport-perspective-select"
            :value="perspective"
            :data-testid="
              primary ? 'preview-perspective-select' : `preview-perspective-select-${viewportId}`
            "
            @change="onPerspectiveChange"
          >
            <option v-for="opt in PREVIEW_PERSPECTIVE_OPTIONS" :key="opt" :value="opt">
              {{ labelForPreviewPerspective(opt) }}
            </option>
          </select>
        </label>

        <button
          type="button"
          class="viewport-move-btn"
          title="左移"
          :disabled="!canMoveLeft"
          :data-testid="`preview-viewport-move-left-${viewportId}`"
          @click="emit('move-left')"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <button
          type="button"
          class="viewport-move-btn"
          title="右移"
          :disabled="!canMoveRight"
          :data-testid="`preview-viewport-move-right-${viewportId}`"
          @click="emit('move-right')"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <button
        type="button"
        class="viewport-remove-btn"
        title="移除此视口"
        :data-testid="`preview-viewport-remove-${viewportId}`"
        @click="emit('remove')"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>

    <div ref="phoneRef" class="preview-phone" data-toast-root :style="phoneStyle">
      <main class="preview-stage" :data-testid="`stage-${currentStage}`">
        <GameShell />
      </main>
      <LottieCanvas />
    </div>
  </div>
</template>

<style scoped>
.preview-viewport-wrap {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  max-width: 100%;
}

.viewport-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  min-height: 24px;
}

.viewport-header-start {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.viewport-header-start > * + * {
  margin-left: 4px;
}

.viewport-perspective-picker {
  position: relative;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  margin: 0;
  cursor: pointer;
}

.viewport-perspective-label {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(10, 11, 16, 0.92);
  color: var(--kit-text-secondary);
  font-size: 11px;
  font-weight: bold;
  line-height: 1.2;
  white-space: nowrap;
}

@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .viewport-perspective-label {
    background: rgba(10, 11, 16, 0.78);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
  }
}

.viewport-perspective-select {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  border: none;
  opacity: 0;
  cursor: pointer;
}

.viewport-move-btn,
.viewport-remove-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: rgba(10, 11, 16, 0.92);
  color: var(--kit-text-muted);
  cursor: pointer;
}

.viewport-move-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.viewport-move-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--kit-text-primary);
}

.viewport-remove-btn:hover {
  background: rgba(255, 59, 48, 0.35);
  color: var(--kit-accent-danger);
}

.preview-phone {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--kit-bg-app);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.preview-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
}
</style>
