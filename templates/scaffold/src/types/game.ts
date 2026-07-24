/** 替换为 product.md §2.1 阶段 ID */
export type StageId = string;

/** 阶段展示名；② 按 product 各阶段标题填写 */
export const STAGE_LABELS: Record<string, string> = {
  loading: '加载中',
  ready: '准备',
};

/** product.md §2.1 阶段顺序 */
export const ALL_STAGES: StageId[] = ['loading', 'ready'];
