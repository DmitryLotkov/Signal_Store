import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { WebSocketService } from './websocket.service';

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebSocketService],
    });
    service = TestBed.inject(WebSocketService);
  });

  it('should initialize with DISCONNECTED status', () => {
    expect(service.connectionStatus()).toBe('DISCONNECTED');
    expect(service.isConnected()).toBe(false);
    expect(service.lastError()).toBeNull();
  });

  it('should set DISCONNECTED status on disconnect', () => {
    service.disconnect();
    expect(service.connectionStatus()).toBe('DISCONNECTED');
    expect(service.isConnected()).toBe(false);
  });
});
