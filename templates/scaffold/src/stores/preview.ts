import { defineStore } from 'pinia';
import { ref } from 'vue';

/** Preview 专用 — mock 阶段 / 状态 / 视角 */
export const usePreviewStore = defineStore('preview', () => {
  const currentStage = ref('ready');
  const mockUserId = ref('10001');
  const mockRole = ref('owner');

  const stages = ['ready', 'playing', 'game-end'];

  return { currentStage, mockUserId, mockRole, stages };
});
