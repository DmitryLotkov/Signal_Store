---
name: vitest-testing
description: Unit and integration testing patterns for Angular 22 Signals, NgRx SignalStore, and Vitest in the Signal Store exchange platform. Use when writing, running, or fixing tests.
---

# Vitest & Angular Signals Testing Guide

Этот скилл содержит стандарты и шаблоны написания быстрых и надежных модульных тестов с использованием **Vitest** и **Angular 22 Signals**.

---

## ⚡ 1. Базовые команды запуска тестов

```bash
# Запуск тестов конкретного проекта/библиотеки
npx nx test exchange

# Запуск в режиме наблюдения (watch)
npx nx test exchange --watch

# Запуск с генерацией покрытия кода (coverage)
npx nx test exchange --coverage
```

---

## 🧪 2. Тестирование NgRx SignalStore (Изолированное тестирование стора)

`signalStore` тестируется напрямую как чистый сервис без необходимости рендерить DOM:

```typescript
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { TradingStore } from './trading.store';

describe('TradingStore', () => {
  let store: InstanceType<typeof TradingStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TradingStore],
    });
    store = TestBed.inject(TradingStore);
  });

  it('должен инициализироваться с дефолтным тикером', () => {
    expect(store.selectedSymbol()).toBe('BTC-USDT');
    expect(store.isLoading()).toBe(false);
  });

  it('должен корректно изменять выбранный тикер', () => {
    store.setSymbol('ETH-USDT');
    expect(store.selectedSymbol()).toBe('ETH-USDT');
  });

  it('должен рассчитывать вычисляемые свойства (computed)', () => {
    store.setOrders([
      { id: '1', symbol: 'BTC-USDT', side: 'BUY', price: '60000', qty: '1', status: 'NEW' },
      { id: '2', symbol: 'ETH-USDT', side: 'BUY', price: '3000', qty: '2', status: 'NEW' },
    ]);

    expect(store.activeOrdersCount()).toBe(1);
    expect(store.activeOrders()[0].symbol).toBe('BTC-USDT');
  });
});
```

---

## ⏱ 3. Тестирование асинхронных эффектов и таймеров

При тестировании компонентов с `effect()` или таймерами котировок используйте таймеры Vitest и сброс эффектов Angular:

```typescript
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

describe('MarketData Stream', () => {
  it('должен батчить обновления котировок по таймеру', () => {
    vi.useFakeTimers();

    // Запуск таймера или подписки...
    vi.advanceTimersByTime(100);

    // Сброс ожидающих Angular-эффектов
    TestBed.flushEffects();

    // Проверка состояния...
    vi.useRealTimers();
  });
});
```
