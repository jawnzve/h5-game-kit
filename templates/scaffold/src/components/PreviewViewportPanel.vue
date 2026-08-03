<script setup lang="ts">
/** Preview 侧栏「视口」区：新增并排视口、显示当前视口数 */
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import {
  labelForPreviewPerspective,
  PREVIEW_PERSPECTIVE_OPTIONS,
} from '@/lib/preview-perspectives';
import { usePreviewStore, type PreviewPerspective } from '@/stores/preview';

const preview = usePreviewStore();
const { viewports } = storeToRefs(preview);

const newViewportPerspective = ref<PreviewPerspective>(
  PREVIEW_PERSPECTIVE_OPTIONS[PREVIEW_PERSPECTIVE_OPTIONS.length - 1]
);

const options = computed(() =>
  PREVIEW_PERSPECTIVE_OPTIONS.map((p) => ({ value: p, label: labelForPreviewPerspective(p) }))
);
</script>

<template>
  <label>
    新视口视角
    <select v-model="newViewportPerspective" data-testid="preview-add-viewport-perspective">
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
  </label>
  <button
    type="button"
    class="add-viewport-btn"
    data-testid="preview-add-viewport"
    @click="preview.addViewport(newViewportPerspective)"
  >
    + 添加视口
  </button>
  <p class="viewport-count">{{ viewports.length }} 个视口并排预览</p>
</template>

<style scoped>
label {
  display: block;
  margin-top: 12px;
  font-size: 12px;
  color: var(--kit-text-secondary);
}
select {
  width: 100%;
  margin-top: 4px;
  padding: 6px;
  border: 1px solid var(--kit-btn-border);
  border-radius: 6px;
  background: rgba(14, 16, 24, 1);
  color: var(--kit-text-primary);
  box-sizing: border-box;
}
.add-viewport-btn {
  width: 100%;
  margin-top: 10px;
  padding: 8px 10px;
  border: 1px dashed rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--kit-text-primary);
  font-size: 12px;
  cursor: pointer;
}
.add-viewport-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.35);
}
.viewport-count {
  margin: 8px 0 0;
  font-size: 10px;
  color: var(--kit-text-dim);
}
</style>
