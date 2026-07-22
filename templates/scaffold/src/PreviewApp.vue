<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePreviewStore } from '@/stores/preview';
import LottieCanvas from '@/components/LottieCanvas.vue';

const preview = usePreviewStore();
const { currentStage, mockUserId, mockRole, stages } = storeToRefs(preview);
const gameName = '{{gameName}}';
</script>

<template>
  <div class="preview-shell" data-testid="preview-shell">
    <aside class="preview-panel">
      <h1>{{ gameName }} — Preview</h1>
      <p class="hint">② 仅 mock 切换阶段/视角，不接 IM/REST</p>
      <label>
        阶段
        <select v-model="currentStage" data-testid="preview-stage-select">
          <option v-for="s in stages" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label>
        userId
        <input v-model="mockUserId" data-testid="preview-user-id" />
      </label>
      <label>
        角色
        <select v-model="mockRole" data-testid="preview-role-select">
          <option value="owner">owner</option>
          <option value="guest">guest</option>
        </select>
      </label>
    </aside>
    <main class="preview-stage" :data-testid="`stage-${currentStage}`">
      <p>当前阶段：<code>{{ currentStage }}</code></p>
      <p>视角：{{ mockRole }} / {{ mockUserId }}</p>
    </main>
    <LottieCanvas />
  </div>
</template>

<style scoped>
.preview-shell {
  display: flex;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
}
.preview-panel {
  width: 220px;
  padding: 16px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
}
.preview-panel label {
  display: block;
  margin-top: 12px;
  font-size: 13px;
}
.preview-panel select,
.preview-panel input {
  width: 100%;
  margin-top: 4px;
}
.preview-panel .hint {
  color: #666;
  font-size: 12px;
}
.preview-stage {
  flex: 1;
  padding: 24px;
}
</style>
