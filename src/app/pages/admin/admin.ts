import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface Usuario {
  id: number; nombres: string; apellidos: string; cedula: string;
  email: string; celular: string; id_perfil: number;
  activo: boolean; verificado_por_admin: boolean; foto_cedula: string | null;
  puntos_confianza: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <!-- Header -->
      <div class="bg-dark text-white p-4 rounded-4 mb-4 shadow" style="background:linear-gradient(135deg,#1a1a2e,#16213e)!important;">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle bg-warning d-flex align-items-center justify-content-center flex-shrink-0" style="width:48px;height:48px;">
            <i class="bi bi-shield-lock fs-4" style="color:#8e0000;"></i>
          </div>
          <div>
            <h4 class="fw-bold mb-0" style="color:var(--amarillo);">Panel de Administración</h4>
            <p class="text-white-50 small mb-0">Gestiona usuarios y categorías del sistema</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-pills nav-fill gap-2 mb-4 p-1 bg-light rounded-3 shadow-sm">
        <li class="nav-item">
          <button class="nav-link rounded-3" [class.active]="tab==='usuarios'" [class.fw-bold]="tab==='usuarios'" (click)="tab='usuarios'">
            <i class="bi bi-people me-1"></i>Usuarios
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link rounded-3" [class.active]="tab==='categorias'" [class.fw-bold]="tab==='categorias'" (click)="tab='categorias'">
            <i class="bi bi-tags me-1"></i>Categorías
          </button>
        </li>
      </ul>

      @if (tab === 'usuarios') {
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="card-title fw-bold mb-0"><i class="bi bi-people" style="color:var(--rojo);"></i> Usuarios</h6>
              <div class="input-group input-group-sm shadow-sm rounded-3" style="max-width:280px;">
                <span class="input-group-text bg-white border-0"><i class="bi bi-search text-muted"></i></span>
                <input [(ngModel)]="busqueda" (input)="filtrarUsuarios()" placeholder="Buscar por nombre, email o cédula..." class="form-control border-0" />
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="fw-semibold">#</th>
                    <th class="fw-semibold">Usuario</th>
                    <th class="fw-semibold">Email</th>
                    <th class="fw-semibold">Perfil</th>
                    <th class="fw-semibold">Verificado</th>
                    <th class="fw-semibold">Estado</th>
                    <th class="fw-semibold text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of usuariosFiltrados; track u.id) {
                    <tr>
                      <td class="text-muted small">{{ u.id }}</td>
                      <td>
                        <div class="d-flex align-items-center gap-2">
                          <div class="rounded-circle bg-danger d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold small" style="width:32px;height:32px;">{{ u.nombres.charAt(0) }}{{ u.apellidos.charAt(0) }}</div>
                          <div>
                            <div class="fw-semibold">{{ u.nombres }} {{ u.apellidos }}</div>
                            <small class="text-muted">C.C. {{ u.cedula }}</small>
                          </div>
                        </div>
                      </td>
                      <td><small>{{ u.email }}</small></td>
                      <td><span class="badge bg-info text-dark rounded-pill">{{ perfiles[u.id_perfil] }}</span></td>
                      <td>
                        <span class="badge rounded-pill" [class.bg-success]="u.verificado_por_admin" [class.bg-secondary]="!u.verificado_por_admin">
                          {{ u.verificado_por_admin ? 'Sí' : 'No' }}
                        </span>
                      </td>
                      <td>
                        <span class="badge rounded-pill" [class.bg-success]="u.activo" [class.bg-secondary]="!u.activo">
                          {{ u.activo ? 'Activo' : 'Bloqueado' }}
                        </span>
                      </td>
                      <td class="text-end">
                        <div class="d-flex gap-1 justify-content-end">
                          @if (!u.verificado_por_admin) {
                            <button class="btn btn-sm btn-outline-success border-0 rounded-3" (click)="verificar(u.id)" title="Verificar"><i class="bi bi-check-lg"></i></button>
                          }
                          <button class="btn btn-sm btn-outline-secondary border-0 rounded-3" (click)="toggleBloqueo(u)" title="Bloquear/Desbloquear">
                            <i class="bi" [class.bi-lock]="u.activo" [class.bi-unlock]="!u.activo"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning border-0 rounded-3" (click)="resetPassword(u.id)" title="Resetear contraseña">
                            <i class="bi bi-key"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      @if (tab === 'categorias') {
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h6 class="card-title fw-bold mb-3"><i class="bi bi-tags" style="color:var(--rojo);"></i> Gestionar categorías</h6>
            <div class="d-flex gap-2 mb-4">
              <div class="input-group shadow-sm rounded-3 flex-grow-1" style="max-width:400px;">
                <input [(ngModel)]="nuevaCat" placeholder="Nombre de la nueva categoría" class="form-control border-0" />
                <button class="btn btn-danger" (click)="agregarCategoria()">
                  <i class="bi bi-plus-lg me-1"></i>Agregar
                </button>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="fw-semibold">#</th>
                    <th class="fw-semibold">Nombre</th>
                    <th class="fw-semibold">Estado</th>
                    <th class="fw-semibold text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of categorias; track c.id) {
                    <tr>
                      <td class="text-muted small">{{ c.id }}</td>
                      <td class="fw-semibold">{{ c.nombre }}</td>
                      <td>
                        <span class="badge rounded-pill" [class.bg-success]="c.activo" [class.bg-secondary]="!c.activo">
                          {{ c.activo ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm rounded-pill" [class.btn-outline-danger]="c.activo" [class.btn-outline-success]="!c.activo" (click)="toggleCategoria(c)">
                          <i class="bi" [class.bi-pause-circle]="c.activo" [class.bi-play-circle]="!c.activo"></i>
                          {{ c.activo ? 'Desactivar' : 'Activar' }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class Admin implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  tab = 'usuarios';
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  busqueda = '';
  categorias: any[] = [];
  nuevaCat = '';

  perfiles: Record<number,string> = { 1:'Superadmin', 2:'Admin', 3:'Campesino', 4:'Consumidor', 5:'Bloqueado' };

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarCategorias();
  }

  cargarUsuarios() {
    this.api.get<Usuario[]>('/usuarios').subscribe({
      next: r => { this.usuarios = r; this.filtrarUsuarios(); this.cdr.detectChanges(); },
      error: () => { this.cdr.detectChanges(); }
    });
  }

  filtrarUsuarios() {
    const q = this.busqueda.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(u =>
      !q || u.nombres.toLowerCase().includes(q) || u.apellidos.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) || u.cedula.includes(q)
    );
  }

  verificar(id: number) {
    this.api.put(`/usuarios/${id}/verificar`).subscribe({ next: () => this.cargarUsuarios() });
  }

  toggleBloqueo(u: Usuario) {
    this.api.put(`/usuarios/${u.id}/bloquear`, { activo: !u.activo }).subscribe({ next: () => this.cargarUsuarios() });
  }

  resetPassword(id: number) {
    const pass = prompt('Nueva contraseña:');
    if (!pass || pass.length < 6) return;
    this.api.put(`/usuarios/${id}/reset-password`, { password: pass }).subscribe({ next: () => alert('Contraseña actualizada') });
  }

  cargarCategorias() {
    this.api.get<any[]>('/categorias').subscribe({ next: r => { this.categorias = r; this.cdr.detectChanges(); } });
  }

  agregarCategoria() {
    if (!this.nuevaCat.trim()) return;
    this.api.post<any>('/categorias', { nombre: this.nuevaCat.trim() }).subscribe({
      next: () => { this.nuevaCat = ''; this.cargarCategorias(); },
      error: e => alert(e.error?.detail || 'Error')
    });
  }

  toggleCategoria(c: any) {
    this.api.put(`/categorias/${c.id}`, { activo: !c.activo }).subscribe({ next: () => this.cargarCategorias() });
  }
}
