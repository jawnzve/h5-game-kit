const DEFAULT_MAX_NICKNAME_LEN = 5;

/** 列表 / 通知等：超过 maxLength 字截断并加 ...（按 Unicode 码点计数，兼容 emoji） */
export function truncateNickname(name: string, maxLength = DEFAULT_MAX_NICKNAME_LEN): string {
  const chars = [...name];
  if (chars.length <= maxLength) return name;
  return `${chars.slice(0, maxLength).join('')}...`;
}
