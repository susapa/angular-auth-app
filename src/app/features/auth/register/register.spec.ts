import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register';
import { AuthService } from '../../../core/services/auth.service';

const mockAuthService = {
  register: jasmine.createSpy('register')
};

describe('RegisterComponent', () => {
  beforeEach(async () => {
    mockAuthService.register.calls.reset();
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('passwordStrength', () => {
    it('returns 0 for empty password', () => {
      const { componentInstance: c } = TestBed.createComponent(RegisterComponent);
      c.form.get('password')!.setValue('');
      expect(c.passwordStrength).toBe(0);
    });

    it('returns 1 for short password meeting minimum length', () => {
      const { componentInstance: c } = TestBed.createComponent(RegisterComponent);
      c.form.get('password')!.setValue('abc123');
      expect(c.passwordStrength).toBe(1);
    });

    it('returns 4 for strong password with length, uppercase, number, symbol', () => {
      const { componentInstance: c } = TestBed.createComponent(RegisterComponent);
      c.form.get('password')!.setValue('Abcdef123!');
      expect(c.passwordStrength).toBe(4);
    });
  });

  describe('passwordMatch validator', () => {
    it('sets passwordMismatch error when passwords differ', () => {
      const { componentInstance: c } = TestBed.createComponent(RegisterComponent);
      c.form.get('password')!.setValue('abc123');
      c.form.get('confirmPassword')!.setValue('different');
      expect(c.form.errors?.['passwordMismatch']).toBeTrue();
    });

    it('clears error when passwords match', () => {
      const { componentInstance: c } = TestBed.createComponent(RegisterComponent);
      c.form.get('password')!.setValue('abc123');
      c.form.get('confirmPassword')!.setValue('abc123');
      expect(c.form.errors).toBeNull();
    });
  });

  describe('fieldClass', () => {
    it('returns error styling for confirmPassword when passwords mismatch and touched', () => {
      const { componentInstance: c } = TestBed.createComponent(RegisterComponent);
      c.form.get('password')!.setValue('abc123');
      c.form.get('confirmPassword')!.setValue('other');
      c.form.get('confirmPassword')!.markAsTouched();
      const cls = c.fieldClass('confirmPassword');
      expect(cls['border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50']).toBeTrue();
    });
  });

  describe('submit', () => {
    it('does not call register when form is invalid', () => {
      const { componentInstance: c } = TestBed.createComponent(RegisterComponent);
      c.submit();
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('calls register with name, email and password when form is valid', () => {
      mockAuthService.register.and.returnValue(of({ access_token: 'tok' }));
      const { componentInstance: c } = TestBed.createComponent(RegisterComponent);
      c.form.setValue({ name: 'John', email: 'john@example.com', password: 'secret1', confirmPassword: 'secret1' });
      c.submit();
      expect(mockAuthService.register).toHaveBeenCalledWith({ name: 'John', email: 'john@example.com', password: 'secret1' });
    });

    it('sets error message on register failure', () => {
      mockAuthService.register.and.returnValue(throwError(() => ({ error: { error: 'Email taken' } })));
      const { componentInstance: c } = TestBed.createComponent(RegisterComponent);
      c.form.setValue({ name: 'John', email: 'john@example.com', password: 'secret1', confirmPassword: 'secret1' });
      c.submit();
      expect(c.error).toBe('Email taken');
      expect(c.loading).toBeFalse();
    });
  });
});
