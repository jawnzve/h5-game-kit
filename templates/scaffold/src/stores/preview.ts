import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ALL_STAGES, STAGE_LABELS, type StageId } from '@/types/game';

export type PreviewPerspectiveOption = {
  value: string;
  label: string;
};

/** Preview 专用 — mock 阶段 / 视角；② 按 product 扩展 */
export const usePreviewStore = defineStore('preview', () => {
  const currentStage = ref<StageId>('ready');
  const mockUserId = ref('10001');
  const perspective = ref('default');

  /** 手机视口尺寸（默认 iPhone SE）；由 PreviewDevicePanel 切换预设或自定义 */
  const previewPhoneWidth = ref(375);
  const previewPhoneHeight = ref(667);

  /** ② 按 product §1 各段视角填写；可随 currentStage 在 computed 中过滤 */
  const perspectiveOptions = ref<PreviewPerspectiveOption[]>([
    { value: 'default', label: '默认视角' },
  ]);

  const stageTitle = computed(
    () => STAGE_LABELS[currentStage.value] ?? currentStage.value
  );

  const stages = ALL_STAGES;

  /** 切换视角时同步 mock 用户/角色等；② 按 product 实现 */
  function applyPerspectivePreset() {
    /* h5-game-ui */
  }

  return {
    currentStage,
    mockUserId,
    perspective,
    previewPhoneWidth,
    previewPhoneHeight,
    perspectiveOptions,
    stageTitle,
    stages,
    applyPerspectivePreset,
  };
});
