import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SlipService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  upload(file: File): Observable<unknown> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post(`${this.apiUrl}/slips/upload`, form);
  }
}
