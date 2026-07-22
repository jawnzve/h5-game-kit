<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/stores/game';
import LottieCanvas from '@/components/LottieCanvas.vue';

const game = useGameStore();
const { currentStage, loading, error } = storeToRefs(game);
const gameName = '{{gameName}}';
</script>

<template>
  <div class="app-shell" data-testid="app-shell">
    <header class="app-header">
      <h1>{{ gameName }} — App</h1>
      <p class="hint">④ 在此接 IM/REST；E2E 只测本页</p>
    </header>
    <main data-testid="stage-root">
      <p v-if="loading">加载中…</p>
      <p v-if="error" data-testid="el-toast-error">{{ error }}</p>
      <section v-else :data-testid="`stage-${currentStage}`">
        当前阶段：<code>{{ currentStage }}</code>
      </section>
    </main>
    <LottieCanvas />
  </div>
</template>

<style scoped>
.app-shell {
  font-family: system-ui, sans-serif;
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
}
.app-header .hint {
  color: #666;
  font-size: 13px;
}
</style>
