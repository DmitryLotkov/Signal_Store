---
name: cc
description: Clean Code, Conventional Commits & Quality Gate workflow for the Signal Store financial platform. Use to verify code purity, eliminate unused imports, enforce Angular Signals best practices, check financial precision, and format commit messages.
---

# Скилл `cc`: Clean Code & Conventional Commits Quality Gate

Этот скилл обеспечивает наивысшие стандарты качества кода, отсутствие лишних импортов, соблюдение стандартов реактивности Angular Signals и единообразие коммитов для проекта биржи **Signal Store**.

---

## 🔍 Чек-лист чистоты кода (Clean Code Audit)

Перед отправкой изменений или формированием коммита выполните шаги:

### 1. Неиспользуемые импорты и форматирование

- Запустите команду форматирования и сортировки импортов:
  ```bash
  npm run format
  ```
  _Плагин `prettier-plugin-organize-imports` автоматически удалит все неиспользуемые импорты и выстроит их в едином порядке._
- Проверьте отсутствие ошибок линтера:
  ```bash
  npm run lint
  ```

### 2. Angular Signals & Zoneless стандарты

- [x] Все компоненты Standalone, без использования `NgModule`.
- [x] Отсутствует избыточный `changeDetection: ChangeDetectionStrategy.OnPush` (включен глобально по умолчанию).
- [x] Состояние компонентов и хранилищ управляется через `signal()`, `computed()`, `linkedSignal()`.
- [x] Все сайд-эффекты инкапсулированы в `effect()` с обязательной очисткой ресурсов (`onCleanup`).
- [x] Инъекции зависимостей выполнены через функцию `inject()`.

### 3. Финансовая надежность (Exchange Quality Gate)

- [x] **Decimal / Fixed-point**: Расчеты цен, объемов и комиссий не используют `number` с плавающей точкой в критических местах.
- [x] **Memory Leaks**: Все подписки на WebSocket-потоки и таймеры корректно отписываются при уничтожении компонентов (`DestroyRef` / `takeUntilDestroyed`).
- [x] **Data Immutability**: Массивы сделок и структуры стаканов обновляются иммутабельно.

---

## 📝 Стандарт Conventional Commits

Используйте следующий формат сообщений коммитов:

```
<type>(<scope>): <краткое описание в повелительном наклонении>

[необязательное тело с подробным описанием]

[необязательный footer / закрываемые задачи]
```

### Допустимые типы (`<type>`):

- **`feat`**: Новая функциональность (новый тип ордера, тикер, стакан заявок).
- **`fix`**: Исправление ошибки (баг в расчете маржи, сбой WebSocket реконнекта).
- **`perf`**: Оптимизация производительности (виртуальный скролл стакана, батчинг котировок).
- **`refactor`**: Рефакторинг без изменения внешней логики (перевод сервиса на Signals).
- **`style`**: Правки стилей, отступов, форматирования (Prettier).
- **`test`**: Добавление или исправление тестов.
- **`chore`**: Обновление зависимостей, конфигураций сборки Nx/ESLint.

### Допустимые области (`<scope>`):

- `orderbook` — биржевой стакан заявок и глубина рынка
- `market-data` — стриминг тикеров, WebSocket, лента сделок (trades tape)
- `trading` — выставление и отмена ордеров, валидация лимитов
- `positions` — учет балансов, PnL, маржинальные требования
- `chart` — свечной график (K-line), индикаторы объема
- `ui` — общие UI-компоненты (кнопки, инпуты, модальные окна)
- `core` — роутинг, темы, глобальная конфигурация, токены

### Примеры качественных коммитов:

- `feat(orderbook): implement virtual scrolling for L2 depth updates`
- `fix(trading): correct tick size validation for sub-penny crypto pairs`
- `perf(market-data): batch incoming WebSocket ticks using RAF scheduler`
- `refactor(positions): migrate unrealized PnL calculation to computed signals`
- `chore(lint): configure prettier-plugin-organize-imports for auto-cleaning`

---

## 🚀 Команды для выполнения проверок

```bash
# 1. Автоматическая очистка неиспользуемых импортов и форматирование
npm run format

# 2. Проверка линтером ESLint
npm run lint

# 3. Проверка компиляции TypeScript и сборки Angular
npm run build
```
