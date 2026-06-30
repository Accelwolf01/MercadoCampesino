import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card border-0 shadow-lg rounded-4">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <div class="rounded-circle bg-warning d-inline-flex align-items-center justify-content-center mb-3" style="width:64px;height:64px;">
                  <i class="bi bi-person-plus-fill fs-2" style="color:#8e0000;"></i>
                </div>
                <h3 class="fw-bold" style="color:var(--rojo);">Crear cuenta</h3>
                <p class="text-muted small mb-0">Únete a MercadoCampesino como campesino o consumidor</p>
              </div>
              @if (error) {
                <div class="alert alert-danger py-2 small rounded-3"><i class="bi bi-exclamation-triangle me-1"></i>{{ error }}</div>
              }
              <form (ngSubmit)="registrar()">
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Nombres</label>
                    <div class="input-group shadow-sm rounded-3">
                      <span class="input-group-text bg-white border-0"><i class="bi bi-person text-muted"></i></span>
                      <input class="form-control border-0" [(ngModel)]="data.nombres" name="nombres" placeholder="Tus nombres" required />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Apellidos</label>
                    <div class="input-group shadow-sm rounded-3">
                      <span class="input-group-text bg-white border-0"><i class="bi bi-person text-muted"></i></span>
                      <input class="form-control border-0" [(ngModel)]="data.apellidos" name="apellidos" placeholder="Tus apellidos" required />
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Cédula</label>
                  <div class="input-group shadow-sm rounded-3">
                    <span class="input-group-text bg-white border-0"><i class="bi bi-card-text text-muted"></i></span>
                    <input class="form-control border-0" [(ngModel)]="data.cedula" name="cedula" placeholder="Número de cédula" required />
                  </div>
                </div>
                @if (data.tipo === 'campesino') {
                  <div class="mb-3">
                    <label class="form-label fw-semibold small">Selfie con tu documento</label>
                    <div class="input-group shadow-sm rounded-3">
                      <span class="input-group-text bg-white border-0"><i class="bi bi-camera text-muted"></i></span>
                      <input class="form-control border-0" type="file" accept="image/*" (change)="onFileSelected($event)" required />
                    </div>
                    @if (fotoCedulaBase64) {
                      <div class="mt-2">
                        <img [src]="fotoCedulaBase64" class="img-thumbnail rounded-3" style="max-height:120px;" />
                        <small class="text-success ms-2"><i class="bi bi-check-circle"></i> Foto cargada</small>
                      </div>
                    }
                    <small class="text-muted">Tómate una foto sosteniendo tu cédula para verificar tu identidad</small>
                  </div>
                }
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Correo electrónico <span class="text-muted">(opcional)</span></label>
                  <div class="input-group shadow-sm rounded-3">
                    <span class="input-group-text bg-white border-0"><i class="bi bi-envelope text-muted"></i></span>
                    <input class="form-control border-0" [(ngModel)]="data.email" name="email" type="email" placeholder="tu@correo.com" />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Celular</label>
                  <div class="input-group shadow-sm rounded-3">
                    <span class="input-group-text bg-white border-0"><i class="bi bi-phone text-muted"></i></span>
                    <input class="form-control border-0" [(ngModel)]="data.celular" name="celular" placeholder="Número de celular" required />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Contraseña</label>
                  <div class="input-group shadow-sm rounded-3">
                    <span class="input-group-text bg-white border-0"><i class="bi bi-lock text-muted"></i></span>
                    <input class="form-control border-0" [(ngModel)]="data.password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
                  </div>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-semibold small">Tipo de cuenta</label>
                  <select class="form-select shadow-sm rounded-3" [(ngModel)]="data.tipo" name="tipo">
                    <option value="campesino"><i class="bi bi-tree"></i> Campesino (vender productos)</option>
                    <option value="consumidor"><i class="bi bi-cart"></i> Consumidor (comprar productos)</option>
                  </select>
                </div>
                <div class="mb-3 form-check">
                  <input class="form-check-input border-1" type="checkbox" id="terminos" [(ngModel)]="aceptaTerminos" name="terminos" required />
                  <label class="form-check-label small text-muted" for="terminos">
                    Acepto los <strong>términos y condiciones</strong>: entiendo que MercadoCampesino es solo una plataforma gratuita de <strong>conexión</strong> entre campesinos y consumidores.
                    Las <strong>transacciones, pagos, entregas y calidad</strong> de los productos se acuerdan directamente entre las partes,
                    sin responsabilidad de la plataforma.
                  </label>
                </div>
                <button type="submit" class="btn btn-danger w-100 fw-semibold py-2 rounded-3 shadow-sm" [disabled]="cargando || !aceptaTerminos">
                  <i class="bi bi-person-plus me-1"></i>{{ cargando ? 'Registrando...' : 'Crear cuenta' }}
                </button>
              </form>
              <p class="text-center text-muted small mt-4 mb-0">¿Ya tienes cuenta? <a routerLink="/login" class="fw-semibold" style="color:var(--rojo);">Ingresa aquí</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);
  data = { nombres: '', apellidos: '', cedula: '', email: '', celular: '', password: '', tipo: 'campesino' };
  fotoCedulaBase64 = '';
  error = '';
  cargando = false;
  aceptaTerminos = false;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = () => this.fotoCedulaBase64 = reader.result as string;
    reader.readAsDataURL(input.files[0]);
  }

  registrar() {
    this.cargando = true;
    this.error = '';
    const payload: any = { ...this.data };
    if (this.fotoCedulaBase64) payload.foto_cedula = this.fotoCedulaBase64;
    this.auth.register(payload).subscribe({
      next: () => this.router.navigate(['/pending']),
      error: e => {
        this.error = e.error?.detail || 'Error al registrarse';
        this.cargando = false;
      }
    });
  }
}
