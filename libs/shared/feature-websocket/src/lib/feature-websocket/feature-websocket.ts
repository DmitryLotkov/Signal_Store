import { Component, computed, inject, input } from '@angular/core';
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'lib-websocket-status',
  templateUrl: './feature-websocket.html',
  styleUrl: './feature-websocket.css',
})
export class FeatureWebsocket {
  private readonly wsService = inject(WebSocketService);

  readonly label = input<string>('Exchange Stream');

  readonly status = this.wsService.connectionStatus;
  readonly isConnected = this.wsService.isConnected;
  readonly error = this.wsService.lastError;

  readonly statusColor = computed(() => {
    switch (this.status()) {
      case 'CONNECTED':
        return 'status-connected';
      case 'CONNECTING':
      case 'RECONNECTING':
        return 'status-pending';
      case 'ERROR':
        return 'status-error';
      default:
        return 'status-disconnected';
    }
  });

  reconnect(url?: string): void {
    if (url) {
      this.wsService.connect({ url });
    }
  }

  disconnect(): void {
    this.wsService.disconnect();
  }
}
