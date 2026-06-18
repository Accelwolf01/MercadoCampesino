import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers() {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.auth.token()}` });
  }

  get<T>(path: string) {
    return this.http.get<T>(`${environment.apiUrl}${path}`, { headers: this.headers() });
  }

  post<T>(path: string, data?: any) {
    return this.http.post<T>(`${environment.apiUrl}${path}`, data, { headers: this.headers() });
  }

  put<T>(path: string, data?: any) {
    return this.http.put<T>(`${environment.apiUrl}${path}`, data, { headers: this.headers() });
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${environment.apiUrl}${path}`, { headers: this.headers() });
  }
}
