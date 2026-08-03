<script setup lang="ts">
/**
 * Preview 侧栏 Mock 开关区 — 各游戏独有项在此实现。
 * 配合 preview-mock-controls.ts 与 product.md §4+ 矩阵；用 v-if="mockVisible('id')" 控制显示。
 */
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { previewMockControlsForStage } from '@/lib/preview-mock-controls';
import { usePreviewStore } from '@/stores/preview';

const preview = usePreviewStore();
const { currentStage } = storeToRefs(preview);

const hasAnyControl = computed(
  () => previewMockControlsForStage(currentStage.value).length > 0
);
</script>

<template>
  <p v-if="hasAnyControl" class="mock-hint">
    h5-game-preview：在此添加 Mock checkbox / select
  </p>
</template>

<style scoped>
.mock-hint {
  margin: 0;
  font-size: 11px;
  color: #666;
  line-height: 1.4;
}
</style>
