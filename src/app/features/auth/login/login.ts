import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './login.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  error = '';
  loading = false;
  showPassword = false;

  fieldClass(name: string): Record<string, boolean> {
    const ctrl = this.form.get(name)!;
    const invalid = ctrl.invalid && (ctrl.dirty || ctrl.touched);
    return {
      'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500': !invalid,
      'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50': invalid
    };
  }

  showError(field: string, error: string): boolean {
    const ctrl = this.form.get(field)!;
    return ctrl.hasError(error) && (ctrl.dirty || ctrl.touched);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.error ?? 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
