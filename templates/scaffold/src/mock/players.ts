/** Preview mock 玩家（仅 ② 使用；④ App 版数据来自 IM/REST） */
export interface PreviewMockPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  /** ② 按 product.md 扩展：isReady / isMayor / identity 等 */
  [key: string]: unknown;
}

/** pravatar 演示图，仅 Preview 使用；正式素材放 public/games/<gameId>/assets/ */
const MOCK_AVATARS = [
  'https://i.pravatar.cc/88?img=11',
  'https://i.pravatar.cc/88?img=12',
  'https://i.pravatar.cc/88?img=13',
  'https://i.pravatar.cc/88?img=14',
  'https://i.pravatar.cc/88?img=15',
  'https://i.pravatar.cc/88?img=16',
  'https://i.pravatar.cc/88?img=17',
  'https://i.pravatar.cc/88?img=18',
] as const;

/**
 * 昵称刻意覆盖 4 类：中文短 / 中文长 / 英文短 / 英文长（前 4 人即四类样例），
 * 用于在 Preview 里暴露截断、换行、头像错位等布局问题。
 */
export const MOCK_PLAYER_POOL: PreviewMockPlayer[] = [
  { id: '10001', name: '小明', avatarUrl: MOCK_AVATARS[0] },
  { id: '10002', name: '玩家昵称最长的玩家昵称最长的', avatarUrl: MOCK_AVATARS[1] },
  { id: '10003', name: 'Bob', avatarUrl: MOCK_AVATARS[2] },
  { id: '10004', name: 'ChristopherAlexander', avatarUrl: MOCK_AVATARS[3] },
  { id: '10005', name: '阿花', avatarUrl: MOCK_AVATARS[4] },
  { id: '10006', name: '这是一个非常非常长的中文玩家昵称', avatarUrl: MOCK_AVATARS[5] },
  { id: '10007', name: 'Eve', avatarUrl: MOCK_AVATARS[6] },
  { id: '10008', name: 'SuperLongEnglishPlayerName', avatarUrl: MOCK_AVATARS[7] },
];

export function sliceMockPlayers(count: number): PreviewMockPlayer[] {
  const n = Math.max(0, Math.min(MOCK_PLAYER_POOL.length, count));
  return MOCK_PLAYER_POOL.slice(0, n).map((p) => ({ ...p }));
}

export function mockPlayerName(id: string): string {
  return MOCK_PLAYER_POOL.find((p) => p.id === id)?.name ?? id;
}
