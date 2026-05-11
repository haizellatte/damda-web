/**
 * AppBridge — Flutter WebView ↔ Next.js 웹 통신 레이어
 *
 * - Flutter: webview_flutter의 JavascriptChannel("FlutterBridge", ...) 사용
 * - SSR 환경에서는 window 객체가 없으므로 모든 함수에 typeof window 가드 적용
 */

// ─── 메시지 타입 정의 ──────────────────────────────────────────────────────────

export type BridgeEventType =
  | "SHARE_URL"        // Flutter → Web: 공유 URL 수신
  | "AUTH_RESULT"      // Flutter → Web: OAuth 콜백 결과
  | "BACK_PRESSED"     // Flutter → Web: 안드로이드 뒤로가기 버튼
  | "CLOSE_WEBVIEW"    // Web → Flutter: 웹뷰 닫기 요청
  | "OPEN_EXTERNAL";   // Web → Flutter: 외부 브라우저 열기 요청

export type BridgeMessage<T = unknown> = {
  type: BridgeEventType;
  payload: T;
};

export type ShareUrlPayload = {
  url: string;
};

export type OpenExternalPayload = {
  url: string;
};

// ─── 환경 감지 ────────────────────────────────────────────────────────────────

/**
 * Flutter WebView 환경인지 확인 (SSR-safe)
 */
const isFlutterWebView = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window as Window & { FlutterBridge?: unknown }).FlutterBridge;
};

// ─── Web → Flutter 송신 ───────────────────────────────────────────────────────

/**
 * Flutter로 메시지를 전송합니다.
 * Flutter WebView 환경이 아닌 경우 조용히 무시됩니다.
 */
const sendToFlutter = <T>(message: BridgeMessage<T>): void => {
  if (!isFlutterWebView()) return;

  const bridge = (window as Window & { FlutterBridge?: { postMessage: (msg: string) => void } })
    .FlutterBridge;
  bridge?.postMessage(JSON.stringify(message));
};

// ─── Flutter → Web 수신 ───────────────────────────────────────────────────────

/**
 * Flutter로부터 특정 타입의 메시지를 수신합니다.
 * @returns 이벤트 리스너 해제 함수 (cleanup)
 */
const onMessageFromFlutter = <T>(
  eventType: BridgeEventType,
  callback: (payload: T) => void,
): (() => void) => {
  if (typeof window === "undefined") return () => {};

  const handler = (event: MessageEvent<string>) => {
    try {
      const message = JSON.parse(event.data) as BridgeMessage<T>;
      if (message.type === eventType) {
        callback(message.payload);
      }
    } catch {
      // 파싱 불가한 메시지는 무시
    }
  };

  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
};

// ─── 공개 API ─────────────────────────────────────────────────────────────────

export const AppBridge = {
  isFlutterWebView,
  sendToFlutter,
  onMessageFromFlutter,

  /** 외부 브라우저로 URL 열기 요청 */
  openExternal: (url: string) =>
    sendToFlutter<OpenExternalPayload>({ type: "OPEN_EXTERNAL", payload: { url } }),

  /** 웹뷰 닫기 요청 */
  closeWebView: () =>
    sendToFlutter({ type: "CLOSE_WEBVIEW", payload: null }),
} as const;
