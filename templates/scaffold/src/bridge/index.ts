import type { AIGameDeviceInfo, AppBridgeResponse, VoiceRoomInfo } from './types';

function bridge(): Window['hybirdapp'] | undefined {
  return typeof window !== 'undefined' ? window.hybirdapp : undefined;
}

export function isInApp(tag = 'loong'): boolean {
  return bridge()?.inApp?.(tag) ?? false;
}

export function isBridgeAvailable(): boolean {
  const b = bridge();
  return Boolean(b && typeof b.getToken === 'function');
}

export async function getToken(): Promise<string | null> {
  const b = bridge();
  if (!b?.getToken) return null;
  try {
    const res = await b.getToken();
    if (res.errno === 0 || res.errno === 200) {
      return res.data?.token ?? null;
    }
  } catch {
    /* WebView 外或超时 */
  }
  return null;
}

export async function getVoiceRoomInfo(): Promise<VoiceRoomInfo | null> {
  const b = bridge();
  if (!b?.voiceRoomInfo) return null;
  try {
    const res = await b.voiceRoomInfo();
    if (res.errno === 0 || res.errno === 200) {
      return res.data ?? null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function onIM(callback: (data: unknown) => void): void {
  bridge()?.im?.(callback);
}

export function onAIGameDevice(callback: (info: AIGameDeviceInfo) => void): void {
  bridge()?.onAIGameDevice?.(callback);
}

export function onWillEnterForeground(callback: () => void): void {
  bridge()?.willEnterForeground?.(callback);
}

export function onDidEnterBackground(callback: () => void): void {
  bridge()?.didEnterBackground?.(callback);
}

export async function closeWebView(): Promise<AppBridgeResponse | null> {
  const b = bridge();
  if (!b?.finish) return null;
  try {
    return await b.finish();
  } catch {
    return null;
  }
}
