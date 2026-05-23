import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login';
import { AuthService } from '../../../core/services/auth.service';

const mockAuthService = {
  login: jasmine.createSpy('login')
};

describe('LoginComponent', () => {
  beforeEach(async () => {
    mockAuthService.login.calls.reset();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('showError', () => {
    it('returns false when field is pristine', () => {
      const { componentInstance: c } = TestBed.createComponent(LoginComponent);
      expect(c.showError('email', 'required')).toBeFalse();
    });

    it('returns true when field is touched and has the error', () => {
      const { componentInstance: c } = TestBed.createComponent(LoginComponent);
      const ctrl = c.form.get('email')!;
      ctrl.markAsTouched();
      expect(c.showError('email', 'required')).toBeTrue();
    });

    it('returns false when error type does not match', () => {
      const { componentInstance: c } = TestBed.createComponent(LoginComponent);
      const ctrl = c.form.get('email')!;
      ctrl.setValue('not-an-email');
      ctrl.markAsTouched();
      expect(c.showError('email', 'required')).toBeFalse();
    });
  });

  describe('fieldClass', () => {
    it('returns valid styling when pristine', () => {
      const { componentInstance: c } = TestBed.createComponent(LoginComponent);
      const cls = c.fieldClass('email');
      expect(cls['border-gray-300 focus:ring-indigo-500 focus:border-indigo-500']).toBeTrue();
      expect(cls['border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50']).toBeFalse();
    });

    it('returns error styling when touched and invalid', () => {
      const { componentInstance: c } = TestBed.createComponent(LoginComponent);
      c.form.get('email')!.markAsTouched();
      const cls = c.fieldClass('email');
      expect(cls['border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50']).toBeTrue();
    });
  });

  describe('submit', () => {
    it('does not call login when form is invalid', () => {
      const { componentInstance: c } = TestBed.createComponent(LoginComponent);
      c.submit();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('calls login with form values when valid', () => {
      mockAuthService.login.and.returnValue(of({ access_token: 'tok' }));
      const { componentInstance: c } = TestBed.createComponent(LoginComponent);
      c.form.setValue({ email: 'a@b.com', password: 'secret' });
      c.submit();
      expect(mockAuthService.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' });
    });

    it('sets error message on login failure', () => {
      mockAuthService.login.and.returnValue(throwError(() => ({ error: { error: 'Invalid credentials' } })));
      const { componentInstance: c } = TestBed.createComponent(LoginComponent);
      c.form.setValue({ email: 'a@b.com', password: 'wrong' });
      c.submit();
      expect(c.error).toBe('Invalid credentials');
      expect(c.loading).toBeFalse();
    });
  });
});
