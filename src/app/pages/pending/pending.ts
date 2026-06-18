import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card border-0 shadow-lg rounded-4 text-center">
            <div class="card-body p-5">
              <div class="rounded-circle bg-warning d-inline-flex align-items-center justify-content-center mb-4" style="width:80px;height:80px;">
                <i class="bi bi-check-circle-fill fs-1" style="color:#8e0000;"></i>
              </div>
              <h3 class="fw-bold mb-2" style="color:var(--amarillo);">¡Registro exitoso!</h3>
              <div class="bg-light rounded-4 p-3 mb-3">
                <p class="text-muted mb-1">Tu cuenta está pendiente de verificación por un administrador.</p>
                <p class="text-muted small mb-0">Recibirás un correo cuando tu cuenta sea activada y puedas ingresar.</p>
              </div>
              <a routerLink="/login" class="btn btn-danger rounded-3 px-4 fw-semibold shadow-sm">
                <i class="bi bi-box-arrow-in-right me-1"></i>Volver al inicio de sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Pending {}
