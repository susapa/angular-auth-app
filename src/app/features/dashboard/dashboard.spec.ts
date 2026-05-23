import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard';
import { AuthService } from '../../core/services/auth.service';

const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15T00:00:00Z' };

const mockAuthService = {
  me: jasmine.createSpy('me'),
  logout: jasmine.createSpy('logout')
};

describe('DashboardComponent', () => {
  beforeEach(async () => {
    mockAuthService.me.calls.reset();
    mockAuthService.logout.calls.reset();
    mockAuthService.me.and.returnValue(of(mockUser));
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('loads user and clears loading on success', () => {
      const { componentInstance: c } = TestBed.createComponent(DashboardComponent);
      c.ngOnInit();
      expect(c.user()).toEqual(mockUser);
      expect(c.loading()).toBeFalse();
      expect(c.error()).toBe('');
    });

    it('sets error and clears loading on failure', () => {
      mockAuthService.me.and.returnValue(throwError(() => ({ error: { error: 'Unauthorized' } })));
      const { componentInstance: c } = TestBed.createComponent(DashboardComponent);
      c.ngOnInit();
      expect(c.user()).toBeNull();
      expect(c.loading()).toBeFalse();
      expect(c.error()).toBe('Unauthorized');
    });
  });

  describe('timeOfDay', () => {
    it('returns morning for hours < 12', () => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2024-01-01T08:00:00'));
      const { componentInstance: c } = TestBed.createComponent(DashboardComponent);
      expect(c.timeOfDay).toBe('morning');
      jasmine.clock().uninstall();
    });

    it('returns afternoon for hours 12–16', () => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2024-01-01T14:00:00'));
      const { componentInstance: c } = TestBed.createComponent(DashboardComponent);
      expect(c.timeOfDay).toBe('afternoon');
      jasmine.clock().uninstall();
    });

    it('returns evening for hours >= 17', () => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2024-01-01T20:00:00'));
      const { componentInstance: c } = TestBed.createComponent(DashboardComponent);
      expect(c.timeOfDay).toBe('evening');
      jasmine.clock().uninstall();
    });
  });

  describe('logout', () => {
    it('calls auth.logout and navigates to /login', () => {
      const { componentInstance: c } = TestBed.createComponent(DashboardComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      c.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
