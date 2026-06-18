import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-superadmin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <!-- Header -->
      <div class="bg-dark text-white p-4 rounded-4 mb-4 shadow" style="background:linear-gradient(135deg,#1a1a2e,#16213e)!important;">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle bg-warning d-flex align-items-center justify-content-center flex-shrink-0" style="width:48px;height:48px;">
            <i class="bi bi-shield-lock-fill fs-4" style="color:#8e0000;"></i>
          </div>
          <div>
            <h4 class="fw-bold mb-0" style="color:var(--amarillo);">Panel Superadmin</h4>
            <p class="text-white-50 small mb-0">Gestión avanzada de perfiles, permisos y configuración del sistema</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-pills nav-fill gap-2 mb-4 p-1 bg-light rounded-3 shadow-sm">
        <li class="nav-item">
          <button class="nav-link rounded-3" [class.active]="tab==='perfiles'" [class.fw-bold]="tab==='perfiles'" (click)="tab='perfiles'">
            <i class="bi bi-person-badge me-1"></i>Perfiles y permisos
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link rounded-3" [class.active]="tab==='config'" [class.fw-bold]="tab==='config'" (click)="tab='config'">
            <i class="bi bi-gear me-1"></i>Configuración
          </button>
        </li>
      </ul>

      @if (tab === 'perfiles') {
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h6 class="card-title fw-bold mb-4"><i class="bi bi-person-badge" style="color:var(--rojo);"></i> Perfiles del sistema</h6>
            <div class="row g-4">
              @for (p of perfiles; track p.id) {
                <div class="col-lg-6">
                  <div class="card border-0 shadow-sm rounded-4 h-100">
                    <div class="card-header bg-transparent border-0 pt-3 px-3">
                      <div class="d-flex align-items-center gap-2">
                        <div class="rounded-circle bg-warning d-flex align-items-center justify-content-center flex-shrink-0" style="width:36px;height:36px;">
                          <i class="bi bi-person-fill small" style="color:#8e0000;"></i>
                        </div>
                        <h6 class="fw-bold mb-0">{{ p.nombre }}</h6>
                        <span class="badge bg-light text-dark rounded-pill ms-auto">ID {{ p.id }}</span>
                      </div>
                    </div>
                    <div class="card-body px-3 py-2">
                      <label class="form-label fw-semibold small mb-2">Permisos asignados</label>
                      <div class="d-flex flex-wrap gap-2">
                        @for (perm of todosPermisos; track perm.id) {
                          <button class="btn btn-sm rounded-pill d-flex align-items-center gap-1 border-0 shadow-sm"
                            [class.btn-success]="perfilTienePermiso(p.id, perm.id)"
                            [class.btn-outline-secondary]="!perfilTienePermiso(p.id, perm.id)"
                            (click)="togglePermiso(p.id, perm.id, !perfilTienePermiso(p.id, perm.id))">
                            <i class="bi" [class.bi-check-circle-fill]="perfilTienePermiso(p.id, perm.id)" [class.bi-circle]="!perfilTienePermiso(p.id, perm.id)"></i>
                            {{ perm.nombre }}
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (tab === 'config') {
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h6 class="card-title fw-bold mb-3"><i class="bi bi-gear" style="color:var(--rojo);"></i> Configuración del sistema</h6>
            <div class="text-center py-5">
              <div class="bg-light rounded-4 p-5 d-inline-block">
                <i class="bi bi-tools fs-1 text-muted d-block mb-3"></i>
                <p class="text-muted mb-1 fw-semibold">Configuración del sistema</p>
                <p class="text-muted small mb-0">Los parámetros configurables estarán disponibles próximamente.</p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class Superadmin implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  tab = 'perfiles';
  perfiles: any[] = [];
  todosPermisos: any[] = [];
  permisosPerfil: Map<number, Set<number>> = new Map();

  ngOnInit() {
    this.api.get<any[]>('/permisos').subscribe({ next: r => { this.todosPermisos = r; this.cdr.detectChanges(); } });
    this.cargarPerfiles();
  }

  cargarPerfiles() {
    this.api.get<any[]>('/perfiles').subscribe({
      next: r => {
        this.perfiles = r;
        this.permisosPerfil = new Map();
        for (const p of r) {
          this.permisosPerfil.set(p.id, new Set((p.permisos || []).map((x: any) => x.id)));
        }
        this.cdr.detectChanges();
      }
    });
  }

  perfilTienePermiso(idPerfil: number, idPermiso: number): boolean {
    return this.permisosPerfil.get(idPerfil)?.has(idPermiso) ?? false;
  }

  togglePermiso(idPerfil: number, idPermiso: number, asignar: boolean) {
    const obs = asignar
      ? this.api.post(`/perfiles/${idPerfil}/permisos`, { id_permiso: idPermiso })
      : this.api.delete(`/perfiles/${idPerfil}/permisos/${idPermiso}`);
    obs.subscribe({ next: () => this.cargarPerfiles() });
  }
}
