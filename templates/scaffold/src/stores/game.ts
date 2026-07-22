import { defineStore } from 'pinia';
import { ref } from 'vue';

/** App 版 store — ④ 接 IM/REST 后扩展 */
export const useGameStore = defineStore('game', () => {
  const currentStage = ref<string>('ready');
  const loading = ref(false);
  const error = ref<string | null>(null);

  return { currentStage, loading, error };
});
