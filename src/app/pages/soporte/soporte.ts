import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface UsuarioMini { id: number; nombres: string; apellidos: string; id_perfil: number; perfil?: { nombre: string }; }
interface TicketRespuesta { id: number; id_ticket: number; id_autor: number; mensaje: string; created_at: string; autor?: UsuarioMini; }
interface Ticket {
  id: number; id_remitente: number; asunto: string; mensaje: string;
  estado: string; created_at: string; updated_at: string | null;
  remitente?: UsuarioMini; respuestas: TicketRespuesta[];
}

const ESTADOS: Record<string, string> = {
  abierto: 'Abierto', en_progreso: 'En progreso', finalizado: 'Finalizado'
};

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="bg-dark text-white p-4 rounded-4 mb-4 shadow" style="background:linear-gradient(135deg,#1a1a2e,#16213e)!important;">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle bg-warning d-flex align-items-center justify-content-center flex-shrink-0" style="width:48px;height:48px;">
            <i class="bi bi-headset fs-4" style="color:#8e0000;"></i>
          </div>
          <div>
            <h4 class="fw-bold mb-0" style="color:var(--amarillo);">Soporte</h4>
            <p class="text-white-50 small mb-0">Reporta problemas o sugiere cambios</p>
          </div>
        </div>
      </div>

      @if (mensaje) { <div class="alert alert-success alert-dismissible py-2 small rounded-3 shadow-sm"><i class="bi bi-check-circle me-1"></i>{{ mensaje }}<button type="button" class="btn-close btn-close-sm float-end" (click)="mensaje=''"></button></div> }
      @if (error) { <div class="alert alert-danger alert-dismissible py-2 small rounded-3 shadow-sm"><i class="bi bi-exclamation-triangle me-1"></i>{{ error }}<button type="button" class="btn-close btn-close-sm float-end" (click)="error=''"></button></div> }

      @if (esAdmin) {
        <ul class="nav nav-pills mb-4 gap-2">
          <li class="nav-item">
            <button class="nav-link rounded-3" [class.active]="tabAdmin==='abiertos'" (click)="tabAdmin='abiertos'">
              <i class="bi bi-envelope me-1"></i>Activos @if (pendientes.length > 0) { <span class="badge bg-danger ms-1">{{ pendientes.length }}</span> }
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link rounded-3" [class.active]="tabAdmin==='todos'" (click)="tabAdmin='todos'">
              <i class="bi bi-envelope-open me-1"></i>Todos
            </button>
          </li>
        </ul>
      }

      @if (!esAdmin || tabAdmin === 'todos') {
        <div class="card border-0 shadow-sm rounded-4 mb-4">
          <div class="card-body p-4">
            <h6 class="fw-bold mb-3"><i class="bi bi-plus-circle" style="color:var(--rojo);"></i> Nuevo ticket</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Asunto</label>
                <input class="form-control" [(ngModel)]="nuevoTicket.asunto" placeholder="Ej: Solicitar nueva plaza en Usaquén" />
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold small">Describe tu solicitud</label>
                <textarea class="form-control" [(ngModel)]="nuevoTicket.mensaje" rows="3" placeholder="Explica qué necesitas..."></textarea>
              </div>
              <div class="col-12">
                <button class="btn btn-danger" (click)="crearTicket()" [disabled]="enviando || !nuevoTicket.asunto || !nuevoTicket.mensaje">
                  <i class="bi bi-send me-1"></i>{{ enviando ? 'Enviando...' : 'Abrir ticket' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-4">
          <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center">
            <span><i class="bi bi-ticket" style="color:var(--rojo);"></i> {{ esAdmin && tabAdmin === 'abiertos' ? 'Tickets activos' : 'Mis tickets' }}</span>
            <span class="badge bg-danger rounded-pill">{{ mostrar.length }}</span>
          </h6>
          @if (cargando) {
            <div class="text-center py-4"><div class="spinner-border text-danger"></div><p class="text-muted small mt-2 mb-0">Cargando...</p></div>
          } @else if (mostrar.length === 0) {
            <div class="text-center py-5"><i class="bi bi-ticket fs-1 text-muted d-block mb-2"></i><p class="text-muted mb-0">No hay tickets.</p></div>
          } @else {
            @for (t of mostrar; track t.id) {
              <div class="card border-0 shadow-sm rounded-3 mb-3">
                <div class="card-body p-3">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span class="fw-bold">{{ t.asunto }}</span>
                      <span class="badge rounded-pill ms-2 fs-xs"
                        [class.bg-warning]="t.estado==='abierto'"
                        [class.bg-primary]="t.estado==='en_progreso'"
                        [class.bg-success]="t.estado==='finalizado'">
                        {{ ESTADOS[t.estado] || t.estado }}
                      </span>
                    </div>
                    <small class="text-muted">{{ t.created_at | date:'short' }}</small>
                  </div>
                  @if (esAdmin && t.remitente) {
                    <small class="text-muted d-block mb-2"><i class="bi bi-person me-1"></i>{{ t.remitente.nombres }} {{ t.remitente.apellidos }}</small>
                  }
                  <div class="bg-light rounded-3 p-3 mb-2">
                    <p class="mb-0 small">{{ t.mensaje }}</p>
                  </div>

                  @for (r of t.respuestas; track r.id) {
                    <div class="d-flex align-items-start gap-2 mb-2" [class.ms-4]="r.autor?.id_perfil !== t.id_remitente">
                      <div class="flex-shrink-0">
                        <div class="rounded-circle d-flex align-items-center justify-content-center" style="width:28px;height:28px;font-size:11px;"
                          [class.bg-warning]="r.autor?.id_perfil !== t.id_remitente"
                          [class.bg-light]="r.autor?.id_perfil === t.id_remitente">
                          <i class="bi" [class.bi-shield]="r.autor?.id_perfil !== t.id_remitente" [class.bi-person]="r.autor?.id_perfil === t.id_remitente"></i>
                        </div>
                      </div>
                      <div class="flex-grow-1 bg-white rounded-3 p-2 border">
                        <div class="d-flex justify-content-between">
                          <small class="fw-semibold">{{ r.autor?.nombres }} {{ r.autor?.apellidos }}</small>
                          <small class="text-muted">{{ r.created_at | date:'short' }}</small>
                        </div>
                        <p class="mb-0 small mt-1">{{ r.mensaje }}</p>
                      </div>
                    </div>
                  }

                  @if (t.estado !== 'finalizado') {
                    <div class="mt-2">
                      <div class="input-group input-group-sm">
                        <input class="form-control" [(ngModel)]="respuestaTexto[t.id]" placeholder="Escribe un avance..." (keyup.enter)="agregarRespuesta(t)" />
                        <button class="btn btn-outline-success" (click)="agregarRespuesta(t)" [disabled]="!respuestaTexto[t.id]"><i class="bi bi-send"></i></button>
                      </div>
                    </div>
                  }

                  @if (esAdmin && t.estado !== 'finalizado') {
                    <div class="mt-2 d-flex gap-1">
                      @if (t.estado !== 'en_progreso') {
                        <button class="btn btn-outline-primary btn-sm" (click)="cambiarEstado(t, 'en_progreso')"><i class="bi bi-play me-1"></i>En progreso</button>
                      }
                      <button class="btn btn-outline-success btn-sm" (click)="cambiarEstado(t, 'finalizado')"><i class="bi bi-check-lg me-1"></i>Finalizar</button>
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class Soporte implements OnInit {
  ESTADOS = ESTADOS;
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  esAdmin = false;
  tickets: Ticket[] = [];
  pendientes: Ticket[] = [];
  cargando = true;
  enviando = false;
  mensaje = '';
  error = '';
  tabAdmin: 'abiertos' | 'todos' = 'abiertos';
  nuevoTicket = { asunto: '', mensaje: '' };
  respuestaTexto: { [key: number]: string } = {};

  ngOnInit() {
    const u = this.auth.usuario();
    if (!u) { this.router.navigate(['/login']); return; }
    this.esAdmin = u.id_perfil === 1 || u.id_perfil === 2;
    this.cargar();
  }

  get mostrar() {
    if (this.esAdmin && this.tabAdmin === 'abiertos') return this.pendientes;
    return this.tickets;
  }

  cargar() {
    this.cargando = true;
    this.api.get<Ticket[]>('/soporte/tickets').subscribe({
      next: r => { this.tickets = r; this.cargando = false; },
      error: () => this.cargando = false
    });
    if (this.esAdmin) {
      this.api.get<Ticket[]>('/soporte/tickets/pendientes').subscribe({
        next: r => this.pendientes = r,
        error: () => {}
      });
    }
  }

  crearTicket() {
    if (!this.nuevoTicket.asunto || !this.nuevoTicket.mensaje) return;
    this.enviando = true;
    this.api.post<Ticket>('/soporte/tickets', this.nuevoTicket).subscribe({
      next: () => {
        this.mensaje = 'Ticket creado correctamente';
        this.nuevoTicket = { asunto: '', mensaje: '' };
        this.enviando = false;
        this.cargar();
      },
      error: e => { this.error = e.error?.detail || 'Error al crear ticket'; this.enviando = false; }
    });
  }

  agregarRespuesta(t: Ticket) {
    if (!this.respuestaTexto[t.id]) return;
    this.api.post<TicketRespuesta>(`/soporte/tickets/${t.id}/respuestas`, { mensaje: this.respuestaTexto[t.id] }).subscribe({
      next: () => {
        this.respuestaTexto[t.id] = '';
        this.cargar();
      },
      error: e => this.error = e.error?.detail || 'Error al enviar'
    });
  }

  cambiarEstado(t: Ticket, estado: string) {
    this.api.put<Ticket>(`/soporte/tickets/${t.id}/estado?nuevo_estado=${estado}`, {}).subscribe({
      next: () => {
        this.mensaje = `Ticket marcado como "${ESTADOS[estado]}"`;
        this.cargar();
      },
      error: e => this.error = e.error?.detail || 'Error al cambiar estado'
    });
  }
}
