<script setup lang="ts">
/**
 * 游戏阶段 SFC 挂载点 — App 与 Preview 共用。
 * h5-game-preview：按 product.md 实现各 stage 组件并在此 switch / 路由。
 */
import { useGameView } from '@/composables/useGameView';

const { currentStage } = useGameView();
</script>

<template>
  <div class="game-shell" data-testid="game-shell">
    <p class="placeholder">
      GameShell — 在此挂载各阶段 SFC（见 kit PREVIEW-UI-SPEC / werewords 示例）
    </p>
    <p class="meta">当前阶段：<code>{{ currentStage }}</code></p>
  </div>
</template>

<style scoped>
.game-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.placeholder {
  color: #8892b0;
  font-size: 13px;
  text-align: center;
  margin: auto 0;
  padding: 16px;
  line-height: 1.5;
}
.meta {
  font-size: 11px;
  color: #666;
  text-align: center;
  margin: 0 0 8px;
}
</style>
