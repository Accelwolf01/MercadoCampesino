import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card border-0 shadow-lg rounded-4">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <div class="rounded-circle bg-warning d-inline-flex align-items-center justify-content-center mb-3" style="width:64px;height:64px;">
                  <i class="bi bi-gear fs-2" style="color:#8e0000;"></i>
                </div>
                <h4 class="fw-bold" style="color:var(--rojo);">Mi perfil</h4>
                <p class="text-muted small mb-0">Actualiza tus datos personales</p>
              </div>

              @if (mensaje) {
                <div class="alert alert-success py-2 small rounded-3"><i class="bi bi-check-circle me-1"></i>{{ mensaje }}</div>
              }
              @if (error) {
                <div class="alert alert-danger py-2 small rounded-3"><i class="bi bi-exclamation-triangle me-1"></i>{{ error }}</div>
              }

              <form (ngSubmit)="guardar()">
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Nombres</label>
                    <div class="input-group shadow-sm rounded-3">
                      <span class="input-group-text bg-white border-0"><i class="bi bi-person text-muted"></i></span>
                      <input class="form-control border-0" [(ngModel)]="data.nombres" name="nombres" required />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Apellidos</label>
                    <div class="input-group shadow-sm rounded-3">
                      <span class="input-group-text bg-white border-0"><i class="bi bi-person text-muted"></i></span>
                      <input class="form-control border-0" [(ngModel)]="data.apellidos" name="apellidos" required />
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Correo electrónico</label>
                  <div class="input-group shadow-sm rounded-3">
                    <span class="input-group-text bg-white border-0"><i class="bi bi-envelope text-muted"></i></span>
                    <input class="form-control border-0" [(ngModel)]="data.email" name="email" type="email" required />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Celular</label>
                  <div class="input-group shadow-sm rounded-3">
                    <span class="input-group-text bg-white border-0"><i class="bi bi-phone text-muted"></i></span>
                    <input class="form-control border-0" [(ngModel)]="data.celular" name="celular" required />
                  </div>
                </div>
                <button type="submit" class="btn btn-danger w-100 fw-semibold py-2 rounded-3 shadow-sm" [disabled]="cargando">
                  <i class="bi bi-check-lg me-1"></i>{{ cargando ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </form>

              <hr class="my-4" />
              <div class="text-center mb-3">
                <h5 class="fw-bold" style="color:var(--rojo);">Cambiar contraseña</h5>
                <p class="text-muted small mb-0">Ingresa tu contraseña actual y la nueva</p>
              </div>

              @if (msgPass) {
                <div class="alert alert-success py-2 small rounded-3"><i class="bi bi-check-circle me-1"></i>{{ msgPass }}</div>
              }
              @if (errPass) {
                <div class="alert alert-danger py-2 small rounded-3"><i class="bi bi-exclamation-triangle me-1"></i>{{ errPass }}</div>
              }

              <form (ngSubmit)="cambiarPassword()">
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Contraseña actual</label>
                  <div class="input-group shadow-sm rounded-3">
                    <span class="input-group-text bg-white border-0"><i class="bi bi-lock text-muted"></i></span>
                    <input class="form-control border-0" [(ngModel)]="passData.password_actual" name="pass_actual" type="password" required />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Nueva contraseña</label>
                  <div class="input-group shadow-sm rounded-3">
                    <span class="input-group-text bg-white border-0"><i class="bi bi-lock text-muted"></i></span>
                    <input class="form-control border-0" [(ngModel)]="passData.password_nueva" name="pass_nueva" type="password" required minlength="6" />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Confirmar nueva contraseña</label>
                  <div class="input-group shadow-sm rounded-3">
                    <span class="input-group-text bg-white border-0"><i class="bi bi-lock text-muted"></i></span>
                    <input class="form-control border-0" [(ngModel)]="passData.password_confirm" name="pass_confirm" type="password" required minlength="6" />
                  </div>
                </div>
                <button type="submit" class="btn btn-outline-danger w-100 fw-semibold py-2 rounded-3 shadow-sm" [disabled]="cargandoPass">
                  <i class="bi bi-key me-1"></i>{{ cargandoPass ? 'Cambiando...' : 'Cambiar contraseña' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Profile {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  data = { nombres: '', apellidos: '', email: '', celular: '' };
  mensaje = '';
  error = '';
  cargando = false;
  passData = { password_actual: '', password_nueva: '', password_confirm: '' };
  msgPass = '';
  errPass = '';
  cargandoPass = false;

  ngOnInit() {
    const u = this.auth.usuario();
    if (u) {
      this.data.nombres = u.nombres;
      this.data.apellidos = u.apellidos;
      this.data.email = u.email;
      this.data.celular = u.celular;
    }
  }

  guardar() {
    this.cargando = true;
    this.mensaje = '';
    this.error = '';
    this.api.put<any>('/auth/me', this.data).subscribe({
      next: r => {
        this.auth.usuario.set(r);
        localStorage.setItem('usuario', JSON.stringify(r));
        this.mensaje = 'Perfil actualizado correctamente';
        this.cargando = false;
      },
      error: e => {
        this.error = this.extraerError(e);
        this.cargando = false;
      }
    });
  }

  private extraerError(e: any): string {
    if (e.error?.detail) {
      if (typeof e.error.detail === 'string') return e.error.detail;
      if (Array.isArray(e.error.detail)) return e.error.detail[0]?.msg || 'Error de validación';
    }
    return 'Error inesperado, inténtalo de nuevo';
  }

  cambiarPassword() {
    this.msgPass = '';
    this.errPass = '';
    if (this.passData.password_nueva !== this.passData.password_confirm) {
      this.errPass = 'Las contraseñas nuevas no coinciden';
      return;
    }
    this.cargandoPass = true;
    this.api.put<any>('/auth/cambiar-password', {
      password_actual: this.passData.password_actual,
      password_nueva: this.passData.password_nueva
    }).subscribe({
      next: (r: any) => {
        this.msgPass = r?.mensaje || 'Contraseña cambiada correctamente';
        this.passData = { password_actual: '', password_nueva: '', password_confirm: '' };
        this.cargandoPass = false;
      },
      error: e => {
        this.errPass = this.extraerError(e);
        this.cargandoPass = false;
      }
    });
  }
}
