# angular-auth-app

## What this is
An Angular 21 frontend for JWT authentication. Connects to `go-auth-api` running on port 8080.
Stack: Angular 21 (standalone components), RxJS 7, Angular signals for state, Tailwind CSS v3.
Deployed on **Azure Static Web Apps** at `https://wonderful-pebble-03b33ba00.7.azurestaticapps.net`

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
  - `features/upload-slip/upload-slip.ts`
  - `features/slip-report/slip-report.ts`
- New page = new folder under `features/<feature>/<page>/<page>.ts`

## API integration
- All API calls go through a service in `core/services/`. Components never call HttpClient directly.
- Base URL: `environment.apiUrl`. Never hardcode `localhost` in service files.
- Auth token stored in `localStorage` under key `access_token`, refresh token under `refresh_token`.
- `authInterceptor` in `core/interceptors/auth.interceptor.ts` attaches Bearer token automatically and handles 401 by calling `POST /auth/refresh`, retrying the original request, then redirecting to `/login` if refresh fails.
- File uploads use `FormData` (not JSON) — do not set `Content-Type` header manually; let the browser set it with the boundary.

## Services
| Service | File | Methods |
|---------|------|---------|
| AuthService | `core/services/auth.service.ts` | `login`, `register`, `refresh`, `me`, `logout`, `isLoggedIn`, `getToken` |
| SlipService | `core/services/slip.service.ts` | `upload(file: File)` → `POST /slips/upload`, `getReport()` → `GET /slips/report` |

## Route table
| Path | Component | Guard |
|------|-----------|-------|
| /login | LoginComponent | none |
| /register | RegisterComponent | none |
| /dashboard | DashboardComponent | authGuard |
| /upload-slip | UploadSlipComponent | authGuard |
| /slip-report | SlipReportComponent | authGuard |
| / | → redirect to /dashboard | - |
| ** | → redirect to /login | - |

## Environments
- `src/environments/environment.ts` — local dev (`http://localhost:8080`)
- `src/environments/environment.prod.ts` — production (Azure Container Apps URL)
- `angular.json` production config มี `fileReplacements` swap environment file อัตโนมัติตอน build

## Deployment: Azure Static Web Apps
- Auto-deploy เมื่อ push ขึ้น `main` ผ่าน `.github/workflows/azure-static-web-apps-wonderful-pebble-03b33ba00.yml`
- `public/staticwebapp.config.json` — redirect ทุก path → `index.html` (แก้ปัญหา 404 เมื่อ refresh)
- Build command: `ng build` (default configuration = production จาก `angular.json`)

## Standup automation
- `.claude/settings.json` มี Stop hook รัน `.claude/update-standup.ps1` ทุกครั้งที่ Claude หยุด
- Script generate `standup/standup-YYYY-MM-DD.md` จาก `git log --since=today`
- `standup/` โฟลเดอร์อยู่ใน `.gitignore`

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
