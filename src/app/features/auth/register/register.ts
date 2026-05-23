import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './register.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatch });

  error = '';
  loading = false;
  showPassword = false;

  strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  strengthColors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'];
  strengthTextColors = ['text-red-500', 'text-yellow-600', 'text-blue-600', 'text-green-600'];

  get passwordStrength(): number {
    const pw = this.form.get('password')?.value ?? '';
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  passwordMatch(group: AbstractControl) {
    const pw = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pw === confirm ? null : { passwordMismatch: true };
  }

  fieldClass(name: string): Record<string, boolean> {
    const ctrl = this.form.get(name)!;
    const touched = ctrl.dirty || ctrl.touched;
    const invalid = ctrl.invalid && touched;
    const mismatch = name === 'confirmPassword' && this.form.errors?.['passwordMismatch'] && touched;
    return {
      'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500': !invalid && !mismatch,
      'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50': invalid || mismatch
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

    const { name, email, password } = this.form.value;
    this.auth.register({ name: name!, email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.error ?? 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
