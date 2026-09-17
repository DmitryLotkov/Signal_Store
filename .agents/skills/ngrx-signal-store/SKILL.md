---
name: ngrx-signal-store
description: Architecture patterns, best practices, and templates for NgRx SignalStore and @ngrx-toolkit/core in Angular 22+. Use when designing state management, creating stores, connecting WebSocket streams, or configuring DevTools and storage persistence.
---

# NgRx SignalStore & Toolkit Architecture Guide

Этот скилл содержит стандарты проектирования хранилищ состояния на базе `@ngrx/signals` и `@ngrx-toolkit/core` для биржи **Signal Store**.

---

## 🏛 1. Базовые принципы SignalStore

1. **Модульность (Composable Features)**: Стор строится из независимых блоков расширений: `withState`, `withEntities`, `withComputed`, `withMethods`, `withHooks`.
2. **Иммутабельность**: Все изменения состояния выполняются строго через `patchState()`. Прямые мутации объектов запрещены.
3. **DI & Scope**:
   - Глобальные хранилища (Auth, Settings, Global Market) объявляются с `{ providedIn: 'root' }`.
   - Локальные хранилища (компонент стакана, форма ордера) инжектируются на уровне компонента (`providers: [OrderBookStore]`).
4. **DevTools & Storage Sync**:
   - Подключайте `withDevtools('StoreName')` для отладки состояния через Redux DevTools.
   - Подключайте `withStorageSync({ key: '...' })` для сохранения пользовательских настроек в `localStorage`.

---

## 📋 2. Эталонный шаблон хранилища (Trading Store Example)

```typescript
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withDevtools, withStorageSync } from '@ngrx-toolkit/core';
import { pipe, switchMap, tap } from 'rxjs';

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: string; // Строковое представление для сохранения точности
  qty: string;
  status: 'NEW' | 'FILLED' | 'CANCELED';
}

interface TradingState {
  selectedSymbol: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: TradingState = {
  selectedSymbol: 'BTC-USDT',
  isLoading: false,
  error: null,
};

export const TradingStore = signalStore(
  { providedIn: 'root' },
  withDevtools('TradingStore'),
  withState(initialState),
  withEntities<Order>(),
  withStorageSync({
    key: 'signal_store_trading_preferences',
    select: state => ({ selectedSymbol: state.selectedSymbol }),
  }),

  // 1. Вычисляемые свойства (Computed signals)
  withComputed(({ entities, selectedSymbol }) => ({
    activeOrders: computed(() =>
      entities().filter(o => o.symbol === selectedSymbol() && o.status === 'NEW'),
    ),
    activeOrdersCount: computed(
      () => entities().filter(o => o.symbol === selectedSymbol() && o.status === 'NEW').length,
    ),
  })),

  // 2. Методы управления стейтом и реактивные эффекты
  withMethods(store => {
    return {
      setSymbol(selectedSymbol: string): void {
        patchState(store, { selectedSymbol });
      },

      setOrders(orders: Order[]): void {
        patchState(store, setAllEntities(orders));
      },

      setError(error: string | null): void {
        patchState(store, { error, isLoading: false });
      },

      // Реактивный метод обработки потока котировок/ордеров
      connectOrdersStream: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(symbol => {
            // Подключение к сервису WebSocket
            // return webSocketService.watchOrders(symbol)...
            return [];
          }),
          tap({
            next: orders => {
              patchState(store, setAllEntities(orders), { isLoading: false });
            },
            error: err => {
              patchState(store, { error: err.message, isLoading: false });
            },
          }),
        ),
      ),
    };
  }),

  // 3. Хуки жизненного цикла
  withHooks({
    onInit(store) {
      // Инициализация при создании стора
    },
    onDestroy() {
      // Очистка ресурсов при уничтожении
    },
  }),
);
```

---

## ⚡ 3. Правила работы с WebSocket и частыми обновлениями

- **Батчинг тиков**: Не вызывайте `patchState` на каждый единичный WebSocket-тик (например, 200 сделок в секунду). Группируйте тики с использованием `requestAnimationFrame` или оператора `auditTime(50)` перед обновлением стора.
- **Очистка rxMethod**: При использовании `rxMethod` внутри локальных сторов компонентов подписка автоматически завершается при уничтожении стора вместе с компонентом.
