export function openAppWebSocket(url: string): WebSocket {
  return new WebSocket(url);
}
