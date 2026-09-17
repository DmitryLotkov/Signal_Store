import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { bufferTime, filter, map, Observable, Subject } from 'rxjs';
import {
  ConnectionStatus,
  WebSocketConfig,
  WebSocketInboundEnvelope,
  WebSocketOutboundEnvelope,
} from '../models/websocket.models';

const DEFAULT_CONFIG: Required<WebSocketConfig> = {
  url: '',
  reconnectIntervalMs: 3000,
  maxReconnectAttempts: 5,
  heartbeatIntervalMs: 15000,
  batchAuditTimeMs: 50,
};

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private readonly destroyRef = inject(DestroyRef);

  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private currentConfig: Required<WebSocketConfig> = { ...DEFAULT_CONFIG };
  private activeSubscriptions = new Set<string>();

  private readonly incomingMessages$ = new Subject<WebSocketInboundEnvelope>();

  readonly connectionStatus = signal<ConnectionStatus>('DISCONNECTED');
  readonly isConnected = computed(() => this.connectionStatus() === 'CONNECTED');
  readonly lastError = signal<string | null>(null);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disconnect();
    });
  }

  connect(config: WebSocketConfig): void {
    this.currentConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.connectionStatus.set('CONNECTING');
    this.lastError.set(null);

    try {
      this.socket = new WebSocket(this.currentConfig.url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.connectionStatus.set('CONNECTED');
        this.startHeartbeat();
        this.resubscribeActiveChannels();
      };

      this.socket.onmessage = (event: MessageEvent<string>) => {
        try {
          const parsed = JSON.parse(event.data) as WebSocketInboundEnvelope;
          this.incomingMessages$.next(parsed);
        } catch {
          this.incomingMessages$.next({
            event: 'data',
            data: event.data,
            timestamp: Date.now(),
          });
        }
      };

      this.socket.onerror = () => {
        const errorMsg = 'WebSocket encountered a connection error';
        this.lastError.set(errorMsg);
        this.connectionStatus.set('ERROR');
      };

      this.socket.onclose = () => {
        this.stopHeartbeat();
        if (this.connectionStatus() !== 'DISCONNECTED') {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown WebSocket error';
      this.lastError.set(msg);
      this.connectionStatus.set('ERROR');
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.connectionStatus.set('DISCONNECTED');
    this.stopHeartbeat();
    this.clearReconnectTimer();

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  subscribe(channel: string, params?: Record<string, string | number | boolean>): void {
    this.activeSubscriptions.add(channel);
    this.sendEnvelope({
      action: 'subscribe',
      channel,
      params,
    });
  }

  unsubscribe(channel: string): void {
    this.activeSubscriptions.delete(channel);
    this.sendEnvelope({
      action: 'unsubscribe',
      channel,
    });
  }

  send(data: unknown): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(message);
    }
  }

  fromChannel<T>(channel: string): Observable<T> {
    return this.incomingMessages$.pipe(
      filter(msg => msg.channel === channel),
      map(msg => msg.data as T),
    );
  }

  /**
   * Batches high-frequency market data updates into arrays using bufferTime.
   * Prevents excessive render cycles when processing hundreds of ticks per second.
   */
  fromChannelBatched<T>(
    channel: string,
    windowMs = this.currentConfig.batchAuditTimeMs,
  ): Observable<T[]> {
    return this.fromChannel<T>(channel).pipe(
      bufferTime(windowMs),
      filter(items => items.length > 0),
    );
  }

  private sendEnvelope(envelope: WebSocketOutboundEnvelope): void {
    this.send(envelope);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendEnvelope({ action: 'ping' });
      }
    }, this.currentConfig.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();

    if (this.reconnectAttempts >= this.currentConfig.maxReconnectAttempts) {
      this.connectionStatus.set('ERROR');
      this.lastError.set('Max reconnect attempts reached');
      return;
    }

    this.connectionStatus.set('RECONNECTING');
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.currentConfig);
    }, this.currentConfig.reconnectIntervalMs);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private resubscribeActiveChannels(): void {
    for (const channel of this.activeSubscriptions) {
      this.sendEnvelope({ action: 'subscribe', channel });
    }
  }
}
