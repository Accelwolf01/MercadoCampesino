import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
              @if (error) {
                <div class="alert alert-danger py-2 small rounded-3"><i class="bi bi-exclamation-triangle me-1"></i>{{ error }}</div>
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
  error = '';
  cargando = false;
  showPassword = false;

  login() {
    this.cargando = true;
    this.error = '';
    this.auth.login(this.cedula, this.password).subscribe({
      next: r => {
        const perfil = r.usuario.id_perfil;
        if (perfil === 1) this.router.navigate(['/superadmin']);
        else if (perfil === 2) this.router.navigate(['/admin']);
        else if (perfil === 3) this.router.navigate(['/campesino']);
        else if (perfil === 4) this.router.navigate(['/consumidor']);
        else this.router.navigate(['/']);
      },
      error: e => {
        this.error = e.error?.detail || 'Error al iniciar sesión';
        this.cargando = false;
      }
    });
  }
}
