import { HttpInterceptorFn } from '@angular/common/http';

const SKIP_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const shouldSkip = SKIP_PATHS.some(path => req.url.includes(path));
  if (shouldSkip) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');
  if (!token) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  return next(cloned);
};
