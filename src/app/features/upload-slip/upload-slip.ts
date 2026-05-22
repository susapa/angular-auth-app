import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { SlipService } from '../../core/services/slip.service';
import { User } from '../../core/models/auth.models';

@Component({
  selector: 'app-upload-slip',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './upload-slip.html'
})
export class UploadSlipComponent implements OnInit {
  private auth = inject(AuthService);
  private slipService = inject(SlipService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  user = signal<User | null>(null);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  uploading = signal(false);
  uploadError = signal<string | null>(null);
  uploadSuccess = signal(false);
  dragOver = signal(false);

  ngOnInit(): void {
    this.auth.me().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: u => this.user.set(u),
      error: () => this.router.navigate(['/login'])
    });
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  onFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.setFile(file);
  }

  private setFile(file: File): void {
    this.selectedFile.set(file);
    this.uploadError.set(null);
    this.uploadSuccess.set(false);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => this.previewUrl.set(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null);
    }
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file || this.uploading()) return;

    this.uploading.set(true);
    this.uploadError.set(null);
    this.uploadSuccess.set(false);

    this.slipService.upload(file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.uploadSuccess.set(true);
        this.selectedFile.set(null);
        this.previewUrl.set(null);
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadError.set(err?.error?.message ?? 'Upload failed. Please try again.');
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
