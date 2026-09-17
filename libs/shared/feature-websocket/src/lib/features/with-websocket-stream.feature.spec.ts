import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { describe, expect, it } from 'vitest';
import { WebSocketService } from '../services/websocket.service';
import { withWebSocketStream } from './with-websocket-stream.feature';

const TestStore = signalStore(withWebSocketStream());

describe('withWebSocketStream Feature', () => {
  it('should initialize state with default values', () => {
    TestBed.configureTestingModule({
      providers: [TestStore, WebSocketService],
    });

    const store = TestBed.inject(TestStore);
    expect(store.wsStatus()).toBe('DISCONNECTED');
    expect(store.wsError()).toBeNull();
  });

  it('should provide disconnectWebSocket method', () => {
    TestBed.configureTestingModule({
      providers: [TestStore, WebSocketService],
    });

    const store = TestBed.inject(TestStore);
    store.disconnectWebSocket();
    expect(store.wsStatus()).toBe('DISCONNECTED');
  });
});
