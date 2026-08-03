/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAME_ID: string;
  readonly VITE_E2E?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface HttpRequestModule {
  get: (...args: unknown[]) => unknown;
  post: (...args: unknown[]) => unknown;
  callApi: (
    method: string,
    url: string,
    params: Record<string, unknown>,
    options?: Record<string, unknown>
  ) => Promise<unknown>;
  handleApiResponse: (response: unknown, options?: { showError?: boolean }) => boolean;
}

interface ServerTimeSyncModule {
  initialize: (serverTimestamp: number) => void;
  calibrate: (newServerTimestamp?: number) => void;
  now: () => number;
  isInitialized: () => boolean;
  stopTimer: () => void;
  startTimer: () => void;
  getRemainingTime: (endTimestamp: number) => number;
  formatTime: (milliseconds: number) => string;
}

interface ThrottleUtilModule {
  throttleApiCall: (key: string, intervalMs?: number) => boolean;
  DEFAULT_MS: number;
}

interface GameSyncModule {
  setSyncHandler: (handler: { handle: (options?: Record<string, unknown>) => unknown }) => void;
  setInitialSyncHandler: (handler: { handle: () => unknown }) => void;
  sync: (options?: Record<string, unknown>) => Promise<void>;
  initialSync: (options?: Record<string, unknown>) => Promise<void>;
  startDelayedSyncDetection: (delay?: number | null) => void;
  stopDelayedSyncDetection: () => void;
  reset: () => void;
}

interface InputFieldHandle {
  container: HTMLElement;
  input: HTMLInputElement;
  counter: HTMLElement | null;
  getValue: () => string;
  setValue: (val: string) => void;
  destroy: () => void;
  mountTo: (parent: HTMLElement) => void;
  focus: () => void;
  blur: () => void;
}

interface LottiePlayerModule {
  init: (options: {
    instanceId?: string;
    canvasId: string;
    src: string;
    autoplay?: boolean;
    loop?: boolean;
    cdnUrl?: string;
    setAsDefault?: boolean;
    canvasSize?: { width: number; height: number };
  }) => Promise<unknown>;
  destroy: (instanceId?: string) => void;
  destroyAll: () => void;
  hide: (instanceId?: string) => void;
  show: (instanceId?: string, autoplay?: boolean) => void;
  play: (instanceId?: string) => void;
  pause: (instanceId?: string) => void;
  stop: (instanceId?: string) => void;
  getInstance: (instanceId?: string) => {
    instance?: unknown;
    canvas?: HTMLCanvasElement;
    config?: Record<string, unknown>;
  } | null;
  getAllInstanceIds: () => string[];
  getDefaultInstanceId: () => string | null;
  setDefaultInstance: (instanceId: string) => void;
}

interface Window {
  __GAME_ID__?: string;
  showToast?: (
    message: string,
    type?: string,
    duration?: number,
    mountRoot?: HTMLElement
  ) => void;
  showTip?: (message: string, type?: string, duration?: number) => void;
  showAlert?: (
    title: string | Record<string, unknown>,
    message?: string,
    buttons?: string[],
    callback?: (label: string, index: number) => void
  ) => void;
  showLoading?: () => HTMLElement | void;
  hideLoading?: () => void;
  createInputField?: (options: Record<string, unknown>) => InputFieldHandle;
  validateInputLength?: (
    inputOrField: InputFieldHandle | HTMLInputElement,
    maxLength?: number
  ) => { valid: boolean; length: number; maxLength: number };
  LottiePlayer?: LottiePlayerModule;
  httpConfig?: {
    currentEnv: {
      apiBase: string;
      signKey: string;
      trackLogUrl?: string;
      name: string;
    };
  };
  httpRequest?: HttpRequestModule;
  trackLog?: (action: string, message: Record<string, unknown>) => void;
  ServerTimeSync?: ServerTimeSyncModule;
  ThrottleUtil?: ThrottleUtilModule;
  GameSync?: GameSyncModule;
  getCurrentUserId?: () => Promise<number | undefined>;
  userInfo?: { userId?: number };
  currentUserId?: number;
  __testIMHandler?: (json: string) => void;
  __gameLog?: Array<Record<string, unknown>>;
}

declare const md5: (input: string) => string;

interface ZeptoStatic {
  ajax: (options: Record<string, unknown>) => unknown;
}

interface JQueryStatic extends ZeptoStatic {}

interface Window {
  $?: ZeptoStatic;
}
