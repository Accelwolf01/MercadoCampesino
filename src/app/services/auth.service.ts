import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

export interface Usuario {
  id: number; nombres: string; apellidos: string;
  cedula: string; email: string; celular: string;
  id_perfil: number; activo: boolean;
  email_verificado: boolean; celular_verificado: boolean;
  verificado_por_admin: boolean; puntos_confianza: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  usuario = signal<Usuario | null>(null);
  token = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem('token');
    const user = localStorage.getItem('usuario');
    if (saved && user) {
      this.token.set(saved);
      this.usuario.set(JSON.parse(user) as Usuario);
    }
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(r => {
        this.token.set(r.access_token);
        this.usuario.set(r.usuario);
        localStorage.setItem('token', r.access_token);
        localStorage.setItem('usuario', JSON.stringify(r.usuario));
      })
    );
  }

  register(data: any) {
    return this.http.post<any>(`${environment.apiUrl}/auth/registro`, data);
  }

  logout() {
    this.token.set(null);
    this.usuario.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }

  get perfil() { return this.usuario()?.id_perfil; }
  get isLogged() { return this.token() !== null; }
}
