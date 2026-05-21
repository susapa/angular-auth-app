---
name: add-api-service-method
description: Use when the user wants to add a new API call to a service, connect to a new backend endpoint, or add a new method to an Angular service. Triggers include "add a method to call", "call the new endpoint", "add API call for X", "connect to POST /foo", "add updateProfile method".
---

# add-api-service-method SOP

## When to use
User wants to call a backend endpoint from Angular. Examples:
- "Add a method to fetch all posts"
- "Call the PUT /profile endpoint from the profile service"
- "Add changePassword() to auth service"

## Inputs needed
1. Which service file? (existing in `core/services/` or new one?)
2. HTTP method and path (e.g. `POST /posts`, `GET /users/:id`)
3. Request body shape (if POST/PUT/PATCH)?
4. Response body shape?
5. Is auth required? (if yes, interceptor handles it automatically)

## Steps

1. **Add interface(s)** in `src/app/core/models/` if new request/response types are needed:
   ```typescript
   export interface CreatePostRequest {
     title: string;
     body: string;
   }
   export interface Post {
     id: number;
     title: string;
     body: string;
     created_at: string;
   }
   ```
   File name: `kebab-case.models.ts` (e.g. `post.models.ts`)

2. **Add the method** to the relevant service in `core/services/`:
   ```typescript
   methodName(payload?: RequestType): Observable<ResponseType> {
     return this.http.post<ResponseType>(`${this.apiUrl}/path`, payload);
   }
   ```
   Rules:
   - `this.apiUrl` comes from `environment.apiUrl` (set in constructor or field)
   - Do NOT manually set Authorization header — `authInterceptor` does it
   - Return the `Observable` directly. Never `.subscribe()` inside a service.
   - For GET with path param: `` `${this.apiUrl}/resource/${id}` ``
   - For GET with query params: use `{ params: new HttpParams().set('key', value) }`

3. **Create a new service** (if it doesn't exist yet):
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class PostService {
     private http = inject(HttpClient);
     private apiUrl = environment.apiUrl;
   }
   ```

4. **Wire to the component** — inject the service, call in `ngOnInit()` or on user action:
   ```typescript
   // In ngOnInit for page data:
   this.postService.getPosts().subscribe({
     next: (posts) => this.posts.set(posts),
     error: (err) => this.error.set(err.error?.error ?? 'Failed to load.')
   });
   ```
   Or use the async pipe with a stored `posts$` observable property.

5. **Handle errors in the component template** — show inline error message.

## Output checklist
- [ ] Interface/type added in `core/models/` if needed
- [ ] Method added with correct return type `Observable<T>`
- [ ] No manual Authorization header (interceptor handles it)
- [ ] `apiUrl` uses `environment.apiUrl`
- [ ] Component wired to call the new method
- [ ] Error state handled in component template

## Rules
- Services return `Observable<T>`, never subscribe inside a service
- Never hardcode API URLs — always use `environment.apiUrl`
- Never set Authorization header manually — the interceptor does it
- Interface file names: `kebab-case.models.ts`
- If adding to existing service, keep related methods grouped together
