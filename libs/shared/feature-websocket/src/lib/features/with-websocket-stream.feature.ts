import { inject } from '@angular/core';
import { patchState, signalStoreFeature, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { ConnectionStatus, WebSocketConfig } from '../models/websocket.models';
import { WebSocketService } from '../services/websocket.service';

export interface WebSocketStreamState {
  wsStatus: ConnectionStatus;
  wsError: string | null;
}

export function withWebSocketStream() {
  return signalStoreFeature(
    withState<WebSocketStreamState>({
      wsStatus: 'DISCONNECTED',
      wsError: null,
    }),
    withMethods((store, wsService = inject(WebSocketService)) => ({
      connectWebSocket(config: WebSocketConfig): void {
        wsService.connect(config);
        patchState(store, {
          wsStatus: wsService.connectionStatus(),
          wsError: wsService.lastError(),
        });
      },
      disconnectWebSocket(): void {
        wsService.disconnect();
        patchState(store, {
          wsStatus: 'DISCONNECTED',
          wsError: null,
        });
      },
      subscribeToChannel<T>(channel: string, handler: (data: T) => void) {
        return rxMethod<void>(
          pipe(
            tap(() => wsService.subscribe(channel)),
            switchMap(() => wsService.fromChannel<T>(channel)),
            tap(data => handler(data)),
          ),
        );
      },
      subscribeToChannelBatched<T>(
        channel: string,
        handler: (batch: T[]) => void,
        auditMs?: number,
      ) {
        return rxMethod<void>(
          pipe(
            tap(() => wsService.subscribe(channel)),
            switchMap(() => wsService.fromChannelBatched<T>(channel, auditMs)),
            tap(batch => handler(batch)),
          ),
        );
      },
    })),
  );
}
