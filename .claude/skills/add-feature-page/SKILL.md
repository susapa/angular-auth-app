---
name: add-feature-page
description: Use when the user wants to add a new page, view, or route to the Angular app. Triggers include "add a page", "create a screen", "add route for X", "new view for Y", "add a settings page", "create a profile page".
---

# add-feature-page SOP

## When to use
User wants a new navigable page. Examples:
- "Add a profile settings page"
- "Create a page to list all posts"
- "Add an admin dashboard"

## Inputs needed
1. Feature name and page name (determines path: `features/<feature>/<page>/<page>.ts`)
2. Route path (e.g. `/settings`, `/posts`)
3. Protected (requires authGuard) or public?
4. Does it need API data? Which service method and endpoint?

Ask before starting if any is unclear.

## Steps

1. **Create the component file** at `src/app/features/<feature>/<page>/<page>.ts`:
   ```typescript
   import { Component, inject, OnInit, signal } from '@angular/core';

   @Component({
     selector: 'app-<page>',
     standalone: true,
     imports: [],
     template: `
       <div>
         <h1>Page Title</h1>
       </div>
     `
   })
   export class <Page>Component implements OnInit {
     ngOnInit(): void {}
   }
   ```
   - Use `inject()` for DI, not constructor
   - Use `signal()` for component state
   - Use `@if` / `@for` control flow, not `*ngIf` / `*ngFor`

2. **Register the route** in `src/app/app.routes.ts`:
   ```typescript
   // Public:
   { path: 'route', loadComponent: () => import('./features/...').then(m => m.XComponent) }
   // Protected:
   { path: 'route', loadComponent: () => import('./features/...').then(m => m.XComponent), canActivate: [authGuard] }
   ```

3. **Add navigation link** (if needed) in the relevant parent component's template using `routerLink`.

4. **Wire API data** (if the page fetches data):
   - Inject the service from `core/services/`
   - Call in `ngOnInit()` — store result in a `signal()`
   - Show loading and error states in template
   - Do not subscribe inside the service

5. **Handle errors inline** — display an error message in the template when API fails.

## Output checklist
- [ ] Component file created at correct path (Angular 19 convention: `page.ts` not `page.component.ts`)
- [ ] `standalone: true`
- [ ] Route added in `app.routes.ts` using `loadComponent`
- [ ] `authGuard` applied if protected
- [ ] API call wired with loading + error state (if needed)
- [ ] Navigation link added (if appropriate)

## Rules
- All new components must use `standalone: true`. No NgModules.
- Use `inject()` for DI, not constructor parameters
- Never call HttpClient from a component — always go through a service in `core/services/`
- Use `@if` / `@for`, never `*ngIf` / `*ngFor`
- File name: `kebab-case.ts` without `.component` suffix (Angular 19 convention)
- Class name: `PascalCaseComponent`
