import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { timeout } from 'rxjs/operators';

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
    this.api.put<any>('/auth/me', this.data).pipe(timeout(20000)).subscribe({
      next: r => {
        this.auth.usuario.set(r);
        localStorage.setItem('usuario', JSON.stringify(r));
        this.mensaje = 'Perfil actualizado correctamente';
        this.cargando = false;
      },
      error: e => {
        this.error = e.error?.detail || (e.name === 'TimeoutError' ? 'El servidor no respondió. ¿Render dormido?' : 'Error al actualizar perfil');
        this.cargando = false;
      }
    });
  }
}
