import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { SlipService, SlipUpload } from '../../core/services/slip.service';
import { User } from '../../core/models/auth.models';

@Component({
  selector: 'app-slip-report',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './slip-report.html'
})
export class SlipReportComponent implements OnInit {
  private auth = inject(AuthService);
  private slipService = inject(SlipService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  user = signal<User | null>(null);
  uploads = signal<SlipUpload[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.auth.me().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: u => this.user.set(u),
      error: () => this.router.navigate(['/login'])
    });

    this.slipService.getReport().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.uploads.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load report.');
        this.loading.set(false);
      }
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
