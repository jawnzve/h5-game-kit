<script setup lang="ts">
import { computed, provide, watch } from 'vue';
import { storeToRefs } from 'pinia';
import GameShell from '@/components/GameShell.vue';
import LottieCanvas from '@/components/LottieCanvas.vue';
import PreviewDevPanel from '@/components/PreviewDevPanel.vue';
import PreviewDevicePanel from '@/components/PreviewDevicePanel.vue';
import PreviewMockPanel from '@/components/PreviewMockPanel.vue';
import { GAME_VIEW_MODE_KEY } from '@/composables/useGameView';
import { previewPhoneStyle } from '@/lib/preview-devices';
import { previewMockControlsForStage } from '@/lib/preview-mock-controls';
import { usePreviewStore } from '@/stores/preview';
import { ALL_STAGES } from '@/types/game';

provide(GAME_VIEW_MODE_KEY, 'preview');

const gameName = '{{gameName}}';
const preview = usePreviewStore();
const {
  currentStage,
  perspective,
  perspectiveOptions,
  stageTitle,
  previewPhoneWidth,
  previewPhoneHeight,
} = storeToRefs(preview);

watch(perspective, () => preview.applyPerspectivePreset(), { immediate: true });

const hasMockControls = computed(() =>
  previewMockControlsForStage(currentStage.value).length > 0
);

const phoneStyle = computed(() =>
  previewPhoneStyle(previewPhoneWidth.value, previewPhoneHeight.value)
);
</script>

<template>
  <div class="preview-shell" data-testid="preview-shell">
    <aside class="preview-panel">
      <h1>{{ gameName }} — Preview</h1>
      <p class="hint">② mock 切换阶段/视角，不接 IM/REST</p>

      <label>
        阶段
        <select v-model="currentStage" data-testid="preview-stage-select">
          <option v-for="s in ALL_STAGES" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>

      <label>
        视角
        <select v-model="perspective" data-testid="preview-perspective-select">
          <option v-for="o in perspectiveOptions" :key="o.value" :value="o.value">
            {{ o.label }}
          </option>
        </select>
      </label>

      <fieldset class="dev-tools">
        <legend>调试</legend>
        <PreviewDevPanel />
        <PreviewDevicePanel />
      </fieldset>

      <fieldset v-if="hasMockControls" class="toggles">
        <legend>Mock 开关</legend>
        <PreviewMockPanel />
      </fieldset>

      <p v-else class="mock-empty">当前阶段无可 Mock 项</p>

      <p class="meta">当前：{{ stageTitle }}</p>
    </aside>

    <div class="preview-device-area">
      <div
        class="preview-phone"
        data-testid="preview-phone-viewport"
        :style="phoneStyle"
      >
        <main class="preview-stage" :data-testid="`stage-${currentStage}`">
          <GameShell />
        </main>
        <LottieCanvas />
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-shell {
  display: flex;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  background: #0a0b10;
  color: #e8e8f0;
}
.preview-panel {
  width: 260px;
  padding: 16px;
  background: #12141f;
  border-right: 1px solid #2a2f45;
  overflow-y: auto;
  flex-shrink: 0;
}
.preview-panel h1 {
  font-size: 16px;
  margin: 0 0 8px;
}
.preview-panel label {
  display: block;
  margin-top: 12px;
  font-size: 12px;
  color: #a8b4ff;
}
.preview-panel select {
  width: 100%;
  margin-top: 4px;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #333;
  background: #0e1018;
  color: inherit;
  box-sizing: border-box;
}
.preview-panel .hint {
  color: #8892b0;
  font-size: 11px;
  margin: 0;
}
.dev-tools {
  margin-top: 16px;
  border: 1px solid #2a2f45;
  border-radius: 8px;
  padding: 8px;
}
.dev-tools legend {
  font-size: 11px;
  color: #8892b0;
  padding: 0 4px;
}
.toggles {
  margin-top: 16px;
  border: 1px solid #2a2f45;
  border-radius: 8px;
  padding: 8px;
}
.toggles legend {
  font-size: 11px;
  color: #8892b0;
  padding: 0 4px;
}
.toggles label {
  margin-top: 6px;
  color: #ccc;
  font-size: 11px;
  display: flex;
  align-items: center;
}
.mock-empty {
  margin-top: 16px;
  font-size: 11px;
  color: #666;
}
.meta {
  margin-top: 16px;
  font-size: 12px;
  color: #8892b0;
}

/* 电脑浏览器：外侧桌面底色 + 内侧可调尺寸手机视口 */
.preview-device-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-width: 0;
  min-height: 100vh;
  padding: 16px;
  overflow: auto;
  background: #3a3f4b;
  background-image: radial-gradient(circle at 50% 0%, #4a5060 0%, #3a3f4b 55%, #2e323a 100%);
}
.preview-phone {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1d2e;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  flex-shrink: 0;
}
.preview-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
}
</style>
