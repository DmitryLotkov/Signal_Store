export type ConnectionStatus =
  'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR';

export interface WebSocketConfig {
  url: string;
  reconnectIntervalMs?: number;
  maxReconnectAttempts?: number;
  heartbeatIntervalMs?: number;
  batchAuditTimeMs?: number;
}

export interface WebSocketMessage<T = unknown> {
  channel: string;
  data: T;
  timestamp: number;
}

export interface ChannelSubscription {
  channel: string;
  params?: Record<string, string | number | boolean>;
}

export interface WebSocketInboundEnvelope<T = unknown> {
  event?: 'subscribed' | 'unsubscribed' | 'pong' | 'data' | 'error';
  channel?: string;
  data?: T;
  error?: string;
  timestamp?: number;
}

export interface WebSocketOutboundEnvelope {
  action: 'subscribe' | 'unsubscribe' | 'ping';
  channel?: string;
  params?: Record<string, string | number | boolean>;
}
