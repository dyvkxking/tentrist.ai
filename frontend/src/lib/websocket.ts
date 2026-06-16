// WebSocket manager for real-time updates

type MessageHandler = (data: unknown) => void;

interface WebSocketMessage {
  type: string;
  payload: unknown;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isIntentionallyClosed = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("[WebSocket] Connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          const handlers = this.handlers.get(message.type);
          if (handlers) {
            handlers.forEach((handler) => handler(message.payload));
          }
          // Also call wildcard handlers
          const wildcardHandlers = this.handlers.get("*");
          if (wildcardHandlers) {
            wildcardHandlers.forEach((handler) => handler(message));
          }
        } catch (e) {
          console.error("[WebSocket] Failed to parse message:", e);
        }
      };

      this.ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };

      this.ws.onclose = () => {
        console.log("[WebSocket] Connection closed");
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error("[WebSocket] Failed to connect:", error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WebSocket] Max reconnect attempts reached");
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 5);

    console.log(
      `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  send(type: string, payload: unknown) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocket] Cannot send - not connected");
      return false;
    }

    try {
      this.ws.send(JSON.stringify({ type, payload }));
      return true;
    } catch (error) {
      console.error("[WebSocket] Failed to send:", error);
      return false;
    }
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let wsInstance: WebSocketManager | null = null;

export function getWebSocket(url: string): WebSocketManager {
  if (!wsInstance) {
    wsInstance = new WebSocketManager(url);
  }
  return wsInstance;
}

// Hook for WebSocket usage in React
import * as React from "react";

export function useWebSocket(url: string) {
  const ws = React.useMemo(() => getWebSocket(url), [url]);

  React.useEffect(() => {
    ws.connect();
    return () => {
      // Don't disconnect on unmount - let singleton persist
    };
  }, [ws]);

  return ws;
}

// SSE (Server-Sent Events) manager for one-way streaming
export class SSEManager {
  private eventSource: EventSource | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private url: string;
  private reconnectDelay = 5000;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(this.url);

    this.eventSource.onopen = () => {
      console.log("[SSE] Connected");
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handlers = this.handlers.get("message");
        if (handlers) {
          handlers.forEach((handler) => handler(data));
        }
      } catch (e) {
        console.error("[SSE] Failed to parse message:", e);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error("[SSE] Error:", error);
      // EventSource automatically reconnects, but we can add custom logic here
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  subscribe(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Also listen via EventSource if using custom event name
    if (this.eventSource) {
      this.eventSource.addEventListener(event, (e: MessageEvent) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          handler(data);
        } catch (err) {
          console.error(`[SSE] Failed to parse ${event}:`, err);
        }
      });
    }

    return () => {
      const handlers = this.handlers.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  get isConnected() {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}
