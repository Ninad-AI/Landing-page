type WebSocketCtorWithTlsOptions = new (
  url: string,
  protocols?: string | string[],
  options?: { rejectUnauthorized?: boolean }
) => WebSocket;

export function openAppWebSocket(url: string): WebSocket {
  if (process.env.NODE_ENV !== 'production') {
    // Browsers ignore TLS options, but this helps in runtimes that honor them.
    const WebSocketCtor = WebSocket as unknown as WebSocketCtorWithTlsOptions;
    return new WebSocketCtor(url, undefined, { rejectUnauthorized: false });
  }

  return new WebSocket(url);
}
