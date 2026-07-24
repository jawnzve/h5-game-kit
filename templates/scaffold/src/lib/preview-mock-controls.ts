import type { StageId } from '@/types/game';

/**
 * Preview 侧栏 Mock 控件 ID（各游戏按 product.md §4+ 矩阵扩展）。
 * 见 kit docs/PREVIEW-UI-SPEC.md §6.2
 */
export type PreviewMockControlId = string;

/** 各阶段可见的 Mock 项；无则侧栏不显示 Mock 区域 */
export const PREVIEW_MOCK_BY_STAGE: Partial<Record<StageId, PreviewMockControlId[]>> = {
  // 例：ready: [],
  // 例：settle: ['settle-outcome'],
};

export function previewMockControlsForStage(stage: StageId): PreviewMockControlId[] {
  return PREVIEW_MOCK_BY_STAGE[stage] ?? [];
}

export function previewMockControlVisible(stage: StageId, control: PreviewMockControlId): boolean {
  return previewMockControlsForStage(stage).includes(control);
}
