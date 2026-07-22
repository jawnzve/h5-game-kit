/** App bridge 响应（hybirdapp-plugin.js 协议） */
export interface AppBridgeResponse<T = unknown> {
  errno: number;
  error?: string;
  data?: T;
  api?: string;
}

export interface VoiceRoomInfo {
  roomId: number;
  roomCode: number;
  name: string;
}

export interface AIGameDeviceInfo {
  timestamp: number;
  windowIns?: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
}

export interface HybirdAppBridge {
  inApp(tag?: string): boolean;
  getToken(): Promise<AppBridgeResponse<{ token: string }>>;
  copy(textStr: string): Promise<AppBridgeResponse>;
  finish(): Promise<AppBridgeResponse>;
  voiceRoomInfo(): Promise<AppBridgeResponse<VoiceRoomInfo>>;
  willEnterForeground(back: () => void): void;
  didEnterBackground(back: () => void): void;
  willResume(back: () => void): void;
  willPause(back: () => void): void;
  im(back: (data: unknown) => void): void;
  onAIGameDevice(back: (data: AIGameDeviceInfo) => void): void;
}

declare global {
  interface Window {
    hybirdapp?: HybirdAppBridge;
  }
}

export {};
