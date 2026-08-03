<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import PreviewDevPanel from '@/components/PreviewDevPanel.vue';
import PreviewDevicePanel from '@/components/PreviewDevicePanel.vue';
import PreviewMockPanel from '@/components/PreviewMockPanel.vue';
import PreviewPhoneViewport from '@/components/PreviewPhoneViewport.vue';
import PreviewViewportPanel from '@/components/PreviewViewportPanel.vue';
import { previewPhoneStyle } from '@/lib/preview-devices';
import { previewMockControlsForStage } from '@/lib/preview-mock-controls';
import { usePreviewStore } from '@/stores/preview';
import { ALL_STAGES, STAGE_LABELS, type StageId } from '@/types/game';

const gameName = '{{gameName}}';
const preview = usePreviewStore();
const {
  currentStage,
  stageTitle,
  viewports,
  mockPlayerCount,
  previewPhoneWidth,
  previewPhoneHeight,
} = storeToRefs(preview);

const PLAYER_COUNT_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const hasMockControls = computed(
  () => previewMockControlsForStage(currentStage.value).length > 0
);

const phoneStyle = computed(() =>
  previewPhoneStyle(previewPhoneWidth.value, previewPhoneHeight.value)
);

function stageOptionLabel(stage: StageId): string {
  const label = STAGE_LABELS[stage];
  return label ? `${stage}（${label}）` : stage;
}
</script>

<template>
  <div class="preview-shell" data-testid="preview-shell">
    <aside class="preview-panel">
      <h1>{{ gameName }} — Preview</h1>
      <p class="hint">② mock 切换阶段/视角，不接 IM/REST</p>

      <label>
        阶段
        <select v-model="currentStage" data-testid="preview-stage-select">
          <option v-for="s in ALL_STAGES" :key="s" :value="s">{{ stageOptionLabel(s) }}</option>
        </select>
      </label>

      <fieldset class="panel-group">
        <legend>视口</legend>
        <PreviewViewportPanel />
      </fieldset>

      <fieldset class="panel-group">
        <legend>调试</legend>
        <label>
          玩家数量
          <select v-model.number="mockPlayerCount" data-testid="preview-player-count">
            <option v-for="n in PLAYER_COUNT_OPTIONS" :key="n" :value="n">{{ n }} 人</option>
          </select>
        </label>
        <PreviewDevicePanel />
        <PreviewDevPanel />
      </fieldset>

      <fieldset v-if="hasMockControls" class="panel-group">
        <legend>Mock 开关</legend>
        <PreviewMockPanel />
      </fieldset>

      <p v-else class="mock-empty">当前阶段无可 Mock 项</p>

      <p class="meta">当前：{{ stageTitle }}</p>
    </aside>

    <div class="preview-device-area">
      <TransitionGroup tag="div" class="preview-viewports-row" name="viewport-reorder">
        <PreviewPhoneViewport
          v-for="(vp, idx) in viewports"
          :key="vp.id"
          :viewport-id="vp.id"
          :perspective="vp.perspective"
          :phone-style="phoneStyle"
          :current-stage="currentStage"
          :primary="idx === 0"
          :can-move-left="idx > 0"
          :can-move-right="idx < viewports.length - 1"
          @update:perspective="preview.setViewportPerspective(vp.id, $event)"
          @remove="preview.removeViewport(vp.id)"
          @move-left="preview.moveViewport(vp.id, -1)"
          @move-right="preview.moveViewport(vp.id, 1)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style>
/* Preview 为整屏工作台：外层不滚动，侧栏与视口区各自滚动 */
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.preview-shell {
  display: flex;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  background: #0a0b10;
  color: var(--kit-text-primary);
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
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--kit-text-secondary);
}
.preview-panel .hint {
  margin: 0;
  font-size: 11px;
  color: var(--kit-text-muted);
}
.preview-panel > label {
  display: block;
  margin-top: 12px;
  font-size: 12px;
  color: var(--kit-text-secondary);
}
.preview-panel select {
  width: 100%;
  margin-top: 4px;
  padding: 6px;
  border: 1px solid var(--kit-btn-border);
  border-radius: 6px;
  background: rgba(14, 16, 24, 1);
  color: var(--kit-text-primary);
  box-sizing: border-box;
}
.panel-group {
  margin-top: 16px;
  padding: 8px;
  border: 1px solid #2a2f45;
  border-radius: 8px;
}
.panel-group legend {
  padding: 0 4px;
  font-size: 11px;
  color: var(--kit-text-secondary);
}
.panel-group label {
  display: block;
  margin-top: 12px;
  font-size: 12px;
  color: var(--kit-text-secondary);
}
.mock-empty {
  margin-top: 16px;
  font-size: 11px;
  color: var(--kit-text-dim);
}
.meta {
  margin-top: 16px;
  font-size: 12px;
  color: var(--kit-text-muted);
}

/* 外侧桌面底色：多视口横向排列，可横向滚动 */
.preview-device-area {
  flex: 1;
  min-width: 0;
  height: 100%;
  min-height: 0;
  overflow: auto;
  background: #3a3f4b;
  background-image: radial-gradient(circle at 50% 0%, #4a5060 0%, #3a3f4b 55%, #2e323a 100%);
}
.preview-viewports-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  min-width: min-content;
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
}
.preview-viewports-row > * + * {
  margin-left: 12px;
}
.viewport-reorder-move {
  transition: transform var(--kit-transition-card);
}
</style>
