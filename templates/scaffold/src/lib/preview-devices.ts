export type PreviewDeviceId =
  | 'iphone-14-pro-max'
  | 'iphone-12-pro'
  | 'iphone-xr'
  | 'iphone-se'
  | 'custom';

export interface PreviewDevicePreset {
  id: PreviewDeviceId;
  label: string;
  width: number;
  height: number;
}

/** Preview 侧栏机型预设（逻辑分辨率 px） */
export const PREVIEW_DEVICE_PRESETS: PreviewDevicePreset[] = [
  { id: 'iphone-14-pro-max', label: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { id: 'iphone-12-pro', label: 'iPhone 12 Pro', width: 390, height: 844 },
  { id: 'iphone-xr', label: 'iPhone XR', width: 414, height: 896 },
  { id: 'iphone-se', label: 'iPhone SE', width: 375, height: 667 },
  { id: 'custom', label: '自定义设备…', width: 0, height: 0 },
];

export function findPreviewDevice(id: PreviewDeviceId): PreviewDevicePreset | undefined {
  return PREVIEW_DEVICE_PRESETS.find((d) => d.id === id);
}

export const PREVIEW_PHONE_MIN_WIDTH = 280;
export const PREVIEW_PHONE_MIN_HEIGHT = 400;

export function previewPhoneStyle(width: number, height: number): Record<string, string> {
  return {
    width: `${Math.max(PREVIEW_PHONE_MIN_WIDTH, width)}px`,
    height: `${Math.max(PREVIEW_PHONE_MIN_HEIGHT, height)}px`,
  };
}
