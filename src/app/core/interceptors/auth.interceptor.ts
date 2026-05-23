import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const SKIP_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const shouldSkip = SKIP_PATHS.some(path => req.url.includes(path));
  if (shouldSkip) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');
  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);

      return auth.refresh().pipe(
        switchMap(resp =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${resp.access_token}` } }))
        ),
        catchError(() => {
          auth.logout();
          router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    })
  );
};
