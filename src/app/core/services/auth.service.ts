import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.models';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, req).pipe(
      tap(resp => this.storeTokens(resp))
    );
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, req).pipe(
      tap(resp => this.storeTokens(resp))
    );
  }

  refresh(): Observable<AuthResponse> {
    const refresh_token = localStorage.getItem(REFRESH_KEY);
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refresh_token }).pipe(
      tap(resp => this.storeTokens(resp))
    );
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private storeTokens(resp: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, resp.access_token);
    localStorage.setItem(REFRESH_KEY, resp.refresh_token);
  }
}
