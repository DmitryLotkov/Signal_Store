---
name: nx-architecture
description: Nx Monorepo architecture standards, library generation commands, domain slicing, and module boundary rules. Use when creating new libraries, structuring components, or organizing code boundaries.
---

# Nx Monorepo Architecture & Domain Slicing

Этот скилл регламентирует структуру модулей и правила разделения кода в монорепозитории биржи **Signal Store**.

---

## 🏛 1. Слои монорепозитория (Layered Architecture)

Код разделяется по доменам (`exchange`, `market-data`, `trading`, `wallet`, `shared`) и типам библиотек (`type`):

```
libs/
├── <domain>/
│   ├── data-access/      # Signal Stores, REST/WebSocket API клиенты, DTO, модели
│   ├── feature-<name>/   # Умные страницы (Smart/Container), маршрутизация
│   ├── ui-<name>/        # Презентационные компоненты (Dumb), чистый рендеринг
│   └── util-<name>/      # Вспомогательные функции, специфичные для домена
└── shared/
    ├── ui/               # Глобальные UI-компоненты (дизайн-система, кнопки, модалки)
    ├── util/             # Финансовая математика, хелперы сигналов, форматирование
    └── models/           # Общесистемные интерфейсы и перечисления (Enums)
```

---

## 🔒 2. Правила зависимостей (Module Boundaries)

| Тип библиотеки    | Может импортировать                     | Не может импортировать                                        |
| :---------------- | :-------------------------------------- | :------------------------------------------------------------ |
| **`feature`**     | `data-access`, `ui`, `util`             | Другие `feature` того же уровня                               |
| **`ui`**          | `util`, общие `shared-ui`               | `feature`, `data-access` (только чистые `@Input` / `@Output`) |
| **`data-access`** | `util`, внешние библиотеки (NgRx, RxJS) | `feature`, `ui` (полная независимость от представления)       |
| **`util`**        | Другие чистые `util`                    | `feature`, `ui`, `data-access`                                |

---

## ⚡ 3. Команды генерации библиотек (Nx Generators)

При создании новых частей приложения всегда используйте стандартный генератор:

### Генерация `data-access` библиотеки:

```bash
npx nx g @nx/angular:library data-access \
  --directory=libs/<domain>/data-access \
  --tags="scope:<domain>,type:data-access" \
  --standalone \
  --unitTestRunner=vitest \
  --dry-run
```

### Генерация `feature` библиотеки:

```bash
npx nx g @nx/angular:library feature-<name> \
  --directory=libs/<domain>/feature-<name> \
  --tags="scope:<domain>,type:feature" \
  --standalone \
  --unitTestRunner=vitest \
  --dry-run
```

### Генерация `ui` библиотеки:

```bash
npx nx g @nx/angular:library ui-<name> \
  --directory=libs/<domain>/ui-<name> \
  --tags="scope:<domain>,type:ui" \
  --standalone \
  --unitTestRunner=vitest \
  --dry-run
```

_(Уберите флаг `--dry-run` после проверки списка создаваемых файлов)._
