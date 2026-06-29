import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ChatService, ChatConvMini, ChatMsg } from '../../services/chat.service';

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
        <li class="nav-item">
          <button class="nav-link rounded-3" [class.active]="tab==='chat'" [class.fw-bold]="tab==='chat'" (click)="tab='chat';cargarChat()">
            <i class="bi bi-chat-dots me-1"></i>Chat {{ chatPendientes.length > 0 ? '('+chatPendientes.length+')' : '' }}
          </button>
        </li>
      </ul>

      @if (tab === 'usuarios') {
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="card-title fw-bold mb-0"><i class="bi bi-people" style="color:var(--rojo);"></i> Usuarios</h6>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-danger rounded-3" (click)="abrirCrearUsuario()">
                  <i class="bi bi-plus-lg me-1"></i>Crear usuario
                </button>
                <div class="input-group input-group-sm shadow-sm rounded-3" style="max-width:280px;">
                  <span class="input-group-text bg-white border-0"><i class="bi bi-search text-muted"></i></span>
                  <input [(ngModel)]="busqueda" (input)="filtrarUsuarios()" placeholder="Buscar por nombre, email o cédula..." class="form-control border-0" />
                </div>
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
                    <th class="fw-semibold">Documento</th>
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
                        @if (u.foto_cedula) {
                          <button class="btn btn-sm btn-outline-info border-0 rounded-3" (click)="verFoto(u)" title="Ver foto del documento">
                            <i class="bi bi-eye"></i>
                          </button>
                        } @else {
                          <span class="text-muted small">—</span>
                        }
                      </td>
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
                            <button class="btn btn-sm btn-outline-success border-0 rounded-3" (click)="verificar(u.id)" [disabled]="verificarCargando" title="Verificar">
                              <i class="bi" [class.bi-check-lg]="!verificarCargando" [class.bi-arrow-repeat]="verificarCargando"></i>
                            </button>
                          }
                          @if (auth.usuario()?.id_perfil === 1 || u.id_perfil !== 1) {
                            <button class="btn btn-sm btn-outline-secondary border-0 rounded-3" (click)="toggleBloqueo(u)" title="Bloquear/Desbloquear">
                              <i class="bi" [class.bi-lock]="u.id_perfil!==5" [class.bi-unlock]="u.id_perfil===5"></i>
                            </button>
                          }
                          @if (auth.usuario()?.id_perfil === 1 || u.id_perfil !== 1) {
                            <button class="btn btn-sm btn-outline-warning border-0 rounded-3" (click)="resetPassword(u.id)" title="Resetear contraseña">
                              <i class="bi bi-key"></i>
                            </button>
                          }
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

      @if (tab === 'chat') {
        <div class="row g-3">
          <div class="col-md-5">
            <div class="card border-0 shadow-sm rounded-4 mb-3">
              <div class="card-body p-3">
                <h6 class="fw-bold mb-3"><i class="bi bi-inbox" style="color:var(--rojo);"></i> Pendientes</h6>
                @if (chatPendientes.length === 0) {
                  <p class="text-muted small text-center py-3 mb-0">No hay conversaciones pendientes</p>
                }
                @for (c of chatPendientes; track c.id) {
                  <div class="d-flex justify-content-between align-items-center p-2 rounded-3 mb-1" [class.bg-light]="chatSeleccionada?.id !== c.id" [class.bg-danger.bg-opacity-10]="chatSeleccionada?.id === c.id" style="cursor:pointer;" (click)="seleccionarChat(c)">
                    <div class="small">
                      <div class="fw-semibold">{{ c.nombre }}</div>
                      <div class="text-muted" style="font-size:11px;">{{ c.created_at | date:'short' }}</div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger rounded-3" (click)="$event.stopPropagation();tomarChat(c)" [disabled]="chatCargando">
                      <i class="bi bi-hand-index"></i> Tomar
                    </button>
                  </div>
                }
              </div>
            </div>
            <div class="card border-0 shadow-sm rounded-4 mb-3">
              <div class="card-body p-3">
                <h6 class="fw-bold mb-3"><i class="bi bi-chat" style="color:var(--amarillo);"></i> Mis chats</h6>
                @if (chatAsignadas.length === 0) {
                  <p class="text-muted small text-center py-3 mb-0">No tienes chats activos</p>
                }
                @for (c of chatAsignadas; track c.id) {
                  <div class="d-flex justify-content-between align-items-center p-2 rounded-3 mb-1" [class.bg-light]="chatSeleccionada?.id !== c.id" [class.bg-warning.bg-opacity-10]="chatSeleccionada?.id === c.id" style="cursor:pointer;" (click)="seleccionarChat(c)">
                    <div class="small">
                      <div class="fw-semibold">{{ c.nombre }}</div>
                      <div class="text-muted" style="font-size:11px;">{{ c.created_at | date:'short' }}</div>
                    </div>
                    <span class="badge bg-warning text-dark rounded-pill">En curso</span>
                  </div>
                }
              </div>
            </div>
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-3">
                <h6 class="fw-bold mb-3"><i class="bi bi-clock-history" style="color:var(--rojo);"></i> Historial</h6>
                <div class="d-flex gap-2 mb-2">
                  <input class="form-control form-control-sm" [(ngModel)]="chatBusqueda" (keydown.enter)="buscarHistorial()" placeholder="Buscar por nombre, email o cédula..." />
                  <button class="btn btn-sm btn-danger rounded-3" (click)="buscarHistorial()"><i class="bi bi-search"></i></button>
                </div>
                @if (chatHistorial.length === 0) {
                  <p class="text-muted small text-center py-3 mb-0">Usa el buscador para ver el historial</p>
                }
                @for (c of chatHistorial; track c.id) {
                  <div class="d-flex justify-content-between align-items-center p-2 rounded-3 mb-1" style="cursor:pointer;" (click)="seleccionarChat(c)">
                    <div class="small">
                      <div class="fw-semibold">{{ c.nombre }}</div>
                      <div class="text-muted" style="font-size:11px;">{{ c.created_at | date:'short' }}</div>
                    </div>
                    <span class="badge bg-secondary rounded-pill">Finalizado</span>
                  </div>
                }
              </div>
            </div>
          </div>
          <div class="col-md-7">
            <div class="card border-0 shadow-sm rounded-4" style="height:500px;display:flex;flex-direction:column;">
              @if (!chatSeleccionada) {
                <div class="d-flex align-items-center justify-content-center flex-grow-1 text-muted">
                  <div class="text-center">
                    <i class="bi bi-chat-dots fs-1 d-block mb-2"></i>
                    <p class="small">Selecciona una conversación</p>
                  </div>
                </div>
              }
              @if (chatSeleccionada) {
                <div class="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-bold small">{{ chatSeleccionada.nombre }}</div>
                    <div class="text-muted" style="font-size:11px;">
                      {{ chatSeleccionada.cedula ? 'CC '+chatSeleccionada.cedula : '' }}
                      {{ chatSeleccionada.email ? '| '+chatSeleccionada.email : '' }}
                    </div>
                  </div>
                  @if (chatSeleccionada.estado !== 'finalizado') {
                    <button class="btn btn-sm btn-outline-secondary rounded-3" (click)="finalizarChat(chatSeleccionada.id)">
                      <i class="bi bi-check-lg"></i> Finalizar
                    </button>
                  }
                </div>
                <div class="flex-grow-1 overflow-auto p-3 bg-light">
                  @for (m of chatMensajes; track m.id) {
                    <div class="d-flex mb-2" [class.justify-content-end]="!m.es_admin" [class.justify-content-start]="m.es_admin">
                      <div class="rounded-3 px-3 py-2 small" style="max-width:80%;"
                        [class.bg-danger.text-white]="!m.es_admin"
                        [class.bg-white]="m.es_admin">
                        <div>{{ m.mensaje }}</div>
                        <div class="mt-1" [class.text-white-50]="!m.es_admin" [class.text-muted]="m.es_admin" style="font-size:10px;">
                          {{ m.created_at | date:'short' }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
                @if (chatSeleccionada.estado !== 'finalizado') {
                  <div class="p-2 bg-white border-top">
                    <div class="d-flex gap-2">
                      <input class="form-control form-control-sm rounded-3" [(ngModel)]="chatRespuesta" (keydown.enter)="responderChat()" placeholder="Escribe tu respuesta..." />
                      <button class="btn btn-danger btn-sm rounded-3" (click)="responderChat()" [disabled]="!chatRespuesta.trim() || chatCargando">
                        <i class="bi bi-send"></i>
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }

    <!-- Modal crear usuario -->
    @if (crearModal) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.6);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow rounded-4">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-person-plus me-1" style="color:var(--rojo);"></i>
                Crear usuario
              </h5>
              <button type="button" class="btn-close" (click)="crearModal = false"></button>
            </div>
            <div class="modal-body p-4">
              @if (crearError) {
                <div class="alert alert-danger py-2 small rounded-3">{{ crearError }}</div>
              }
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Nombres</label>
                  <input class="form-control form-control-sm" [(ngModel)]="crearForm.nombres" placeholder="Nombres" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Apellidos</label>
                  <input class="form-control form-control-sm" [(ngModel)]="crearForm.apellidos" placeholder="Apellidos" />
                </div>
              </div>
              <div class="mb-2">
                <label class="form-label fw-semibold small">Cédula</label>
                <input class="form-control form-control-sm" [(ngModel)]="crearForm.cedula" placeholder="Número de cédula" />
              </div>
              <div class="mb-2">
                <label class="form-label fw-semibold small">Email</label>
                <input class="form-control form-control-sm" [(ngModel)]="crearForm.email" type="email" placeholder="correo@ejemplo.com" />
              </div>
              <div class="mb-2">
                <label class="form-label fw-semibold small">Celular</label>
                <input class="form-control form-control-sm" [(ngModel)]="crearForm.celular" placeholder="Número de celular" />
              </div>
              <div class="mb-2">
                <label class="form-label fw-semibold small">Contraseña</label>
                <input class="form-control form-control-sm" [(ngModel)]="crearForm.password" type="password" placeholder="Mínimo 6 caracteres" />
              </div>
              <div class="mb-2">
                <label class="form-label fw-semibold small">Perfil</label>
                <select class="form-select form-select-sm" [(ngModel)]="crearForm.id_perfil">
                  @for (p of perfilesDisponibles; track p.id) {
                    <option [ngValue]="p.id">{{ p.nombre }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="modal-footer border-0 pt-0 justify-content-center gap-2">
              <button class="btn btn-outline-secondary rounded-3" (click)="crearModal = false">
                <i class="bi bi-x me-1"></i>Cancelar
              </button>
              <button class="btn btn-danger rounded-3" (click)="guardarUsuario()" [disabled]="crearCargando">
                <i class="bi bi-check-lg me-1"></i>{{ crearCargando ? 'Creando...' : 'Crear usuario' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal foto documento -->
    @if (fotoModal) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.6);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow rounded-4">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-card-image me-1" style="color:var(--rojo);"></i>
                Verificar documento
              </h5>
              <button type="button" class="btn-close" (click)="fotoModal = null"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row mb-3">
                <div class="col-md-6">
                  <div class="bg-light rounded-3 p-3">
                    <h6 class="fw-bold mb-3"><i class="bi bi-person me-1"></i>Datos del usuario</h6>
                    <div class="mb-1"><small class="text-muted">Nombre:</small></div>
                    <div class="fw-semibold mb-2">{{ fotoModal.nombres }} {{ fotoModal.apellidos }}</div>
                    <div class="mb-1"><small class="text-muted">Cédula registrada:</small></div>
                    <div class="fw-semibold mb-2" style="color:var(--rojo);">CC {{ fotoModal.cedula }}</div>
                    <div class="mb-1"><small class="text-muted">Email:</small></div>
                    <div class="mb-2">{{ fotoModal.email }}</div>
                    <div class="mb-1"><small class="text-muted">Celular:</small></div>
                    <div class="mb-0">{{ fotoModal.celular }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <h6 class="fw-bold mb-3"><i class="bi bi-camera me-1"></i>Foto del documento</h6>
                  @if (fotoModal.foto_cedula) {
                    <img [src]="fotoModal.foto_cedula" class="img-fluid rounded-3 shadow-sm w-100" style="max-height:350px;object-fit:contain;" />
                    <small class="text-muted d-block mt-1">Verifica que el número de cédula coincida con el documento</small>
                  } @else {
                    <div class="bg-light rounded-3 d-flex align-items-center justify-content-center" style="height:200px;">
                      <i class="bi bi-file-earmark-x fs-1 text-muted"></i>
                      <span class="ms-2 text-muted">Sin foto</span>
                    </div>
                  }
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 pt-0 justify-content-center gap-2">
              <button class="btn btn-outline-secondary rounded-3" (click)="fotoModal = null">
                <i class="bi bi-x me-1"></i>Cerrar
              </button>
              @if (!fotoModal.verificado_por_admin && fotoModal.foto_cedula) {
                <button class="btn btn-danger rounded-3" (click)="verificar(fotoModal.id)" [disabled]="verificarCargando">
                  <i class="bi" [class.bi-check-lg]="!verificarCargando" [class.bi-arrow-repeat]="verificarCargando"></i>
                  {{ verificarCargando ? 'Verificando...' : 'Aprobar y verificar' }}
                </button>
                <button class="btn btn-outline-danger rounded-3" (click)="rechazar(fotoModal.id)">
                  <i class="bi bi-x me-1"></i>Rechazar
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class Admin implements OnInit {
  private api = inject(ApiService);
  private chatSvc = inject(ChatService);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  tab = 'usuarios';
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  busqueda = '';
  categorias: any[] = [];
  nuevaCat = '';
  fotoModal: Usuario | null = null;
  verificarCargando = false;
  crearModal = false;
  crearCargando = false;
  crearError = '';
  crearForm = { nombres: '', apellidos: '', cedula: '', email: '', celular: '', password: '', id_perfil: 2 };
  perfilesDisponibles: { id: number; nombre: string }[] = [];

  perfiles: Record<number,string> = { 1:'Superadmin', 2:'Admin', 3:'Campesino', 4:'Consumidor', 5:'Bloqueado' };

  chatPendientes: ChatConvMini[] = [];
  chatAsignadas: ChatConvMini[] = [];
  chatHistorial: ChatConvMini[] = [];
  chatSeleccionada: ChatConvMini | null = null;
  chatMensajes: ChatMsg[] = [];
  chatRespuesta = '';
  chatCargando = false;
  chatBusqueda = '';

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarCategorias();
    this.cargarPerfilesDisponibles();
  }

  cargarPerfilesDisponibles() {
    const perfilActual = this.auth.usuario()?.id_perfil;
    const todos = [
      { id: 1, nombre: 'Superadmin' },
      { id: 2, nombre: 'Admin' },
      { id: 3, nombre: 'Campesino' },
      { id: 4, nombre: 'Consumidor' },
    ];
    if (perfilActual === 1) {
      this.perfilesDisponibles = todos;
    } else {
      this.perfilesDisponibles = todos.filter(p => p.id >= 2);
    }
    this.crearForm.id_perfil = this.perfilesDisponibles[0]?.id || 2;
  }

  abrirCrearUsuario() {
    this.crearForm = { nombres: '', apellidos: '', cedula: '', email: '', celular: '', password: '', id_perfil: this.perfilesDisponibles[0]?.id || 2 };
    this.crearError = '';
    this.crearModal = true;
  }

  guardarUsuario() {
    this.crearCargando = true;
    this.crearError = '';
    this.api.post<any>('/usuarios', this.crearForm).subscribe({
      next: () => {
        this.crearModal = false;
        this.crearCargando = false;
        this.cargarUsuarios();
      },
      error: e => {
        this.crearError = e.error?.detail || 'Error al crear usuario';
        this.crearCargando = false;
      }
    });
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

  verFoto(u: Usuario) {
    this.fotoModal = u;
  }

  verificar(id: number) {
    this.verificarCargando = true;
    this.api.put(`/usuarios/${id}/verificar`).subscribe({
      next: () => { this.verificarCargando = false; this.fotoModal = null; this.cargarUsuarios(); },
      error: () => { this.verificarCargando = false; }
    });
  }

  rechazar(id: number) {
    if (!confirm('¿Estás seguro? Se eliminará la solicitud y el usuario podrá volver a registrarse.')) return;
    this.api.put(`/usuarios/${id}/rechazar`).subscribe({
      next: () => { this.fotoModal = null; this.cargarUsuarios(); }
    });
  }

  toggleBloqueo(u: Usuario) {
    if (u.id_perfil === 5) {
      this.api.put(`/usuarios/${u.id}/activar`).subscribe({ next: () => this.cargarUsuarios() });
    } else {
      this.api.put(`/usuarios/${u.id}/bloquear`).subscribe({ next: () => this.cargarUsuarios() });
    }
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

  cargarChat() {
    this.chatSvc.pendientes().subscribe({ next: r => { this.chatPendientes = r; this.cdr.detectChanges(); } });
    this.chatSvc.asignadas().subscribe({ next: r => { this.chatAsignadas = r; this.cdr.detectChanges(); } });
    this.chatHistorial = [];
    this.chatBusqueda = '';
  }

  seleccionarChat(c: ChatConvMini) {
    this.chatSeleccionada = c;
    this.chatSvc.obtenerConv(c.id, '').subscribe({
      next: conv => { this.chatMensajes = conv.mensajes; this.cdr.detectChanges(); }
    });
  }

  tomarChat(c: ChatConvMini) {
    this.chatCargando = true;
    this.chatSvc.tomar(c.id).subscribe({
      next: () => { this.chatCargando = false; this.cargarChat(); this.seleccionarChat(c); },
      error: () => this.chatCargando = false
    });
  }

  responderChat() {
    if (!this.chatRespuesta.trim() || !this.chatSeleccionada) return;
    this.chatCargando = true;
    this.chatSvc.responderAdmin(this.chatSeleccionada.id, this.chatRespuesta).subscribe({
      next: msg => {
        this.chatMensajes.push(msg);
        this.chatRespuesta = '';
        this.chatCargando = false;
        this.cdr.detectChanges();
      },
      error: () => this.chatCargando = false
    });
  }

  buscarHistorial() {
    this.chatSvc.historial(this.chatBusqueda).subscribe({
      next: r => { this.chatHistorial = r; this.cdr.detectChanges(); }
    });
  }

  finalizarChat(id: number) {
    if (!confirm('¿Finalizar esta conversación?')) return;
    this.chatSvc.finalizar(id).subscribe({
      next: () => { this.chatSeleccionada = null; this.cargarChat(); this.cdr.detectChanges(); }
    });
  }
}
