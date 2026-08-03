import { mockPlayerName } from '@/mock/players';
import type { PreviewPerspective } from '@/stores/preview';

export interface PreviewPerspectiveConfig {
  id: PreviewPerspective;
  /** 视角角标 / 下拉里的身份文案 */
  label: string;
  /** 该视角对应的 mock 用户；观众等无座位视角留空串 */
  mockUserId: string;
}

/**
 * ② 按 product.md §1 整局流程各段视角替换本表（如 创建者 / 村长 / 各身份 / 观众）。
 * Preview 默认按本表顺序为每个视角开一个并排视口。
 */
export const PREVIEW_PERSPECTIVES: PreviewPerspectiveConfig[] = [
  { id: 'player', label: '玩家', mockUserId: '10001' },
  { id: 'spectator', label: '观众', mockUserId: '' },
];

export const PREVIEW_PERSPECTIVE_OPTIONS: PreviewPerspective[] =
  PREVIEW_PERSPECTIVES.map((p) => p.id);

export function findPreviewPerspective(
  perspective: PreviewPerspective
): PreviewPerspectiveConfig | undefined {
  return PREVIEW_PERSPECTIVES.find((p) => p.id === perspective);
}

export function resolvePreviewMockUserId(perspective: PreviewPerspective): string {
  return findPreviewPerspective(perspective)?.mockUserId ?? '';
}

/** 视角下拉 / 视口角标文案：`[身份] 玩家昵称`；无座位视角只显示 `[身份]` */
export function labelForPreviewPerspective(perspective: PreviewPerspective): string {
  const config = findPreviewPerspective(perspective);
  if (!config) return perspective;
  if (!config.mockUserId) return `[${config.label}]`;
  return `[${config.label}] ${mockPlayerName(config.mockUserId)}`;
}
