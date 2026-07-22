export function isE2E(): boolean {
  if (import.meta.env.VITE_E2E === '1') return true;
  try {
    return new URLSearchParams(window.location.search).has('e2e');
  } catch {
    return false;
  }
}

export function setupE2EHooks(gameId: string): void {
  if (!isE2E()) return;

  window.__gameLog = window.__gameLog ?? [];

  window.__testIMHandler = (json: string) => {
    window.__gameLog?.push({ type: 'im', json, at: Date.now() });
    window.dispatchEvent(new CustomEvent('game:im', { detail: json }));
  };

  window.__gameLog.push({ type: 'boot', gameId, at: Date.now() });
}
