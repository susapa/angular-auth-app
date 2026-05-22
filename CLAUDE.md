# angular-auth-app

## What this is
An Angular 21 frontend for JWT authentication. Connects to `go-auth-api` running on port 8080.
Stack: Angular 21 (standalone components), RxJS 7, Angular signals for state, Tailwind CSS v3.

## Angular style: standalone components, functional APIs, Angular 21 conventions
- All components use `standalone: true`. No NgModules.
- File naming: `kebab-case.ts` without `.component` suffix (Angular 21 convention). E.g. `login.ts`, `dashboard.ts`.
- Class naming: `LoginComponent`, `DashboardComponent` (PascalCase + Component suffix).
- Router: functional guards (`CanActivateFn`) in `core/guards/`.
- HTTP: functional interceptors (`HttpInterceptorFn`) in `core/interceptors/`, registered in `app.config.ts`.
- DI: use `inject()` function, not constructor injection.
- State: prefer Angular `signal()` for component state over class properties.
- Forms: `ReactiveFormsModule` with `FormBuilder`. No template-driven forms.
- Templates: use `@if` / `@for` control flow (Angular 17+ syntax). Not `*ngIf` / `*ngFor`.

## Folder structure rules
- `core/` = singleton services, guards, interceptors, shared models. One instance app-wide.
  - `core/services/` = all API services
  - `core/guards/` = route guards
  - `core/interceptors/` = HTTP interceptors
  - `core/models/` = shared TypeScript interfaces
- `features/` = one subfolder per feature. Each feature has its own components.
  - `features/auth/login/login.ts`
  - `features/auth/register/register.ts`
  - `features/dashboard/dashboard.ts`
- New page = new folder under `features/<feature>/<page>/<page>.ts`

## API integration
- All API calls go through a service in `core/services/`. Components never call HttpClient directly.
- Base URL: `environment.apiUrl`. Never hardcode `localhost` in service files.
- Auth token stored in `localStorage` under key `access_token`.
- `authInterceptor` in `core/interceptors/auth.interceptor.ts` attaches Bearer token automatically.

## Route table
| Path | Component | Guard |
|------|-----------|-------|
| /login | LoginComponent | none |
| /register | RegisterComponent | none |
| /dashboard | DashboardComponent | authGuard |
| / | → redirect to /dashboard | - |
| ** | → redirect to /login | - |

## Skills available
See [SKILLS.md](./SKILLS.md)

## Tailwind notes
- Version is v3 (not v4). Do not upgrade — v4 conflicts with Angular's esbuild PostCSS pipeline.
- `tailwind.config.js` uses `path.join(__dirname, 'src/**/*.{html,ts}')` for content paths (absolute path required).
- `styles.css` order: `@import` Google Fonts FIRST, then `@tailwind base/components/utilities`.

## Rules
- Never call HttpClient directly from a component
- Never hardcode API URLs in service files (use environment.apiUrl)
- Never use NgModules for new code
- Never use `*ngIf` or `*ngFor` — use `@if` and `@for` (Angular 17+ control flow)
- Components always `standalone: true`
- Use `inject()` for DI, not constructor parameters
- Services return `Observable<T>`, never `.subscribe()` inside a service
- Every subscription must be cleaned up (use `takeUntilDestroyed()` or async pipe for long-lived subscriptions)
