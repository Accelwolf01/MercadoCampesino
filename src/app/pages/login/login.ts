import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, LoginResponse } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  styles: `
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
    }
    .modal-popup {
      background: #fff; border-radius: 16px; padding: 2rem; max-width: 400px; width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: popIn 0.3s ease;
    }
    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,
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
                <div class="modal-overlay">
                  <div class="modal-popup">
                    <div class="text-center mb-3">
                      <i class="bi bi-x-octagon-fill text-danger" style="font-size:3rem;"></i>
                    </div>
                    <h5 class="text-center fw-bold mb-3">Error al iniciar sesión</h5>
                    <p class="text-center text-muted small mb-4">{{ error() }}</p>
                    <button class="btn btn-danger w-100 fw-semibold py-2 rounded-3" (click)="recargar()">Aceptar</button>
                  </div>
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
                <button type="submit" class="btn btn-danger w-100 fw-semibold py-2 rounded-3 shadow-sm" [disabled]="cargando()">
                  <i class="bi bi-box-arrow-in-right me-1"></i>{{ cargando() ? 'Entrando...' : 'Ingresar' }}
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
  cargando = signal(false);
  showPassword = false;

  login() {
    this.cargando.set(true);
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
        this.cargando.set(false);
      }
    );
  }

  recargar() { location.reload(); }
}
