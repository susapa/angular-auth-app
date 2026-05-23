import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SlipUpload {
  id: number;
  user_id: number;
  filename: string;
  path: string;
  size: number;
  uploaded_at: string;
}

@Injectable({ providedIn: 'root' })
export class SlipService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  upload(file: File): Observable<SlipUpload> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<SlipUpload>(`${this.apiUrl}/slips/upload`, form);
  }

  getReport(): Observable<SlipUpload[]> {
    return this.http.get<SlipUpload[]>(`${this.apiUrl}/slips/report`);
  }
}
