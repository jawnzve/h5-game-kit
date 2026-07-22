<template>
  <!-- 全屏庆祝/过场：ito 做法 — 页面加载即挂载，display:none，用 show/hide 控制 -->
  <canvas
    :id="canvasId"
    class="lottie-fullscreen"
    data-testid="el-lottie-canvas"
    aria-hidden="true"
    style="display: none"
  />
</template>

<script setup lang="ts">
import { DEFAULT_LOTTIE_CANVAS_ID } from '@/lib/ui';

withDefaults(
  defineProps<{
    /** 多实例时每个 canvas 唯一 id */
    canvasId?: string;
  }>(),
  { canvasId: DEFAULT_LOTTIE_CANVAS_ID }
);
</script>

<style>
.lottie-fullscreen {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 100vh;
  width: auto;
  pointer-events: none;
  z-index: 9998;
}

/** 内联小动画（如 ito thinking-lottie-canvas） */
.lottie-inline {
  display: block;
  margin: 0 auto;
  max-width: 100%;
}
</style>
