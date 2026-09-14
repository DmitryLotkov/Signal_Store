# Angular 22+ & Signals Rules

1. **Signals Primacy**: Все данные компонентов должны быть сигналами (`signal`, `computed`, `linkedSignal`).
2. **No NgModules**: Весь код пишется исключительно на Standalone Components / Directives / Pipes.
3. **Implicit OnPush**: В Angular 22+ стратегия `OnPush` действует по умолчанию. Явное указание `@Component({ changeDetection: ChangeDetectionStrategy.OnPush })` не требуется.
4. **Clean Dependency Injection**: Используйте функцию `inject(Service)` на уровне полей классов вместо конструкторов.
5. **No Unused Code**: Неиспользуемые импорты и переменные запрещены и автоматически удаляются через `prettier-plugin-organize-imports` и валидируются `eslint-plugin-unused-imports`.
