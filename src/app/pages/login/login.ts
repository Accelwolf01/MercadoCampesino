import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, LoginResponse } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card border-0 shadow-lg rounded-4">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <div class="rounded-circle bg-warning d-inline-flex align-items-center justify-content-center mb-3" style="width:64px;height:64px;">
                  <i class="bi bi-person-fill fs-2" style="color:#8e0000;"></i>
                </div>
                <h3 class="fw-bold" style="color:var(--rojo);">Ingresar</h3>
                <p class="text-muted small mb-0">Accede a tu cuenta de MercadoCampesino</p>
              </div>
              @if (error()) {
                <div class="alert alert-danger d-flex align-items-center gap-2 p-3 rounded-3 border-0 shadow-sm">
                  <i class="bi bi-x-circle-fill fs-4 flex-shrink-0"></i>
                  <span class="small fw-semibold">{{ error() }}</span>
                  <button type="button" class="btn-close ms-auto" (click)="error.set('')" aria-label="Cerrar"></button>
                </div>
              }
              <form (ngSubmit)="login()">
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Cédula</label>
                  <div class="input-group shadow-sm rounded-3">
                    <span class="input-group-text bg-white border-0"><i class="bi bi-card-text text-muted"></i></span>
                    <input class="form-control border-0" [(ngModel)]="cedula" name="cedula" placeholder="Número de cédula" required />
                  </div>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-semibold small">Contraseña</label>
                  <div class="input-group shadow-sm rounded-3">
                    <span class="input-group-text bg-white border-0"><i class="bi bi-lock text-muted"></i></span>
                    <input class="form-control border-0" [(ngModel)]="password" name="password" [type]="showPassword ? 'text' : 'password'" placeholder="••••••••" required />
                    <button type="button" class="input-group-text bg-white border-0" (click)="showPassword = !showPassword" style="cursor:pointer;">
                      <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="text-muted"></i>
                    </button>
                  </div>
                </div>
                <button type="submit" class="btn btn-danger w-100 fw-semibold py-2 rounded-3 shadow-sm" [disabled]="cargando">
                  <i class="bi bi-box-arrow-in-right me-1"></i>{{ cargando ? 'Entrando...' : 'Ingresar' }}
                </button>
              </form>
              <p class="text-center text-muted small mt-4 mb-0">¿No tienes cuenta? <a routerLink="/register" class="fw-semibold" style="color:var(--rojo);">Regístrate aquí</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  cedula = '';
  password = '';
  error = signal('');
  cargando = false;
  showPassword = false;

  login() {
    this.cargando = true;
    this.error.set('');
    this.auth.login(this.cedula, this.password).subscribe(
      (r: LoginResponse) => {
        this.auth.token.set(r.access_token);
        this.auth.usuario.set(r.usuario);
        localStorage.setItem('token', r.access_token);
        localStorage.setItem('usuario', JSON.stringify(r.usuario));
        const perfil = r.usuario.id_perfil;
        if (perfil === 1) this.router.navigate(['/superadmin']);
        else if (perfil === 2) this.router.navigate(['/admin']);
        else if (perfil === 3) this.router.navigate(['/campesino']);
        else if (perfil === 4) this.router.navigate(['/consumidor']);
        else this.router.navigate(['/']);
      },
      (e: HttpErrorResponse) => {
        this.error.set(e.error?.detail || (typeof e.error === 'string' ? e.error : 'Error al iniciar sesi\u00f3n'));
        this.cargando = false;
      }
    );
  }
}
