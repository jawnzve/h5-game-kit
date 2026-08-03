<script setup lang="ts">
import { provide, ref } from 'vue';
import { storeToRefs } from 'pinia';
import GameShell from '@/components/GameShell.vue';
import LottieCanvas from '@/components/LottieCanvas.vue';
import { GAME_VIEW_MODE_KEY } from '@/composables/useGameView';
import { TOAST_ROOT_KEY } from '@/lib/ui';
import { useGameStore } from '@/stores/game';

provide(GAME_VIEW_MODE_KEY, 'app');

const appShellRef = ref<HTMLElement | null>(null);
provide(TOAST_ROOT_KEY, appShellRef);

const game = useGameStore();
const { loading, error } = storeToRefs(game);
</script>

<template>
  <div ref="appShellRef" class="app-shell" data-testid="app-shell" data-toast-root>
    <main class="stage-root" data-testid="stage-root">
      <p v-if="loading" class="loading">加载中…</p>
      <p v-if="error" class="error" data-testid="el-toast-error">{{ error }}</p>
      <GameShell />
    </main>
    <LottieCanvas />
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: system-ui, sans-serif;
  background: var(--kit-bg-app);
  color: var(--kit-text-primary);
}
.stage-root {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.loading {
  text-align: center;
  color: var(--kit-text-muted);
}
.error {
  margin-bottom: 12px;
  text-align: center;
  color: var(--kit-accent-danger);
}
</style>
