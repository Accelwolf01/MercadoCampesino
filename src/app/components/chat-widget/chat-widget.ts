import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatConv, ChatMsg } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-widget" style="position:fixed;bottom:20px;right:20px;z-index:9999;">
      @if (!abierto) {
        <button class="btn btn-danger rounded-circle shadow-lg d-flex align-items-center justify-content-center" style="width:56px;height:56px;" (click)="abrir()">
          <i class="bi bi-chat-dots fs-4"></i>
        </button>
      }
      @if (abierto) {
        <div class="card border-0 shadow-lg rounded-4 overflow-hidden" style="width:360px;height:500px;display:flex;flex-direction:column;">
          <div class="bg-danger text-white p-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-chat-dots fs-5"></i>
              @if (convId) {
                <span class="fw-bold">Chat</span>
              } @else {
                <span class="fw-bold">Chat MercadoCampesino</span>
              }
            </div>
            <div class="d-flex gap-1">
              @if (convId) {
                <button class="btn btn-sm text-white border-0" (click)="nuevaConversacion()" title="Nueva conversación"><i class="bi bi-plus-lg"></i></button>
              }
              <button class="btn btn-sm text-white border-0" (click)="cerrar()"><i class="bi bi-x-lg"></i></button>
            </div>
          </div>
          <div class="flex-grow-1 overflow-auto p-3 bg-light" #chatMsgs>
            @if (!convId) {
              <div class="text-center py-4 text-muted">
                <i class="bi bi-person-circle fs-1 d-block mb-2"></i>
                <p class="small">Hola! Si olvidaste tu contraseña o necesitas ayuda, inicia una conversación</p>
                @if (errorChat) {
                  <div class="alert alert-danger py-1 small mx-2 rounded-3"><i class="bi bi-exclamation-triangle me-1"></i>{{ errorChat }}</div>
                }
                <hr />
              </div>
            }
            @if (mensajes.length > 0) {
              @for (m of mensajes; track m.id) {
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
            }
            @if (!convId) {
              <form (ngSubmit)="iniciarConv()" class="bg-white rounded-3 p-3 shadow-sm">
                <div class="mb-2">
                  <label class="form-label fw-semibold small">Nombre</label>
                  <input class="form-control form-control-sm" [(ngModel)]="nombre" name="nombre" placeholder="Tu nombre" required />
                </div>
                <div class="mb-2">
                  <label class="form-label fw-semibold small">Cédula <span class="text-muted">(opcional)</span></label>
                  <input class="form-control form-control-sm" [(ngModel)]="cedula" name="cedula" placeholder="Número de cédula" />
                </div>
                <div class="mb-2">
                  <label class="form-label fw-semibold small">Email <span class="text-muted">(opcional)</span></label>
                  <input class="form-control form-control-sm" [(ngModel)]="email" name="email" placeholder="correo@ejemplo.com" />
                </div>
                <button type="submit" class="btn btn-danger btn-sm w-100 rounded-3" [disabled]="!nombre.trim() || cargando">
                  <i class="bi bi-send me-1"></i>Iniciar conversación
                </button>
              </form>
            }
          </div>
          @if (convId) {
            <div class="p-2 bg-white border-top">
              <div class="d-flex gap-2">
                <input class="form-control form-control-sm rounded-3" [(ngModel)]="nuevoMensaje" (keydown.enter)="enviarMsg()" placeholder="Escribe un mensaje..." />
                <button class="btn btn-danger btn-sm rounded-3" (click)="enviarMsg()" [disabled]="!nuevoMensaje.trim() || cargando">
                  <i class="bi bi-send"></i>
                </button>
              </div>
              @if (finalizada) {
                <small class="text-muted d-block mt-1 text-center">Esta conversación fue finalizada por un administrador</small>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ChatWidget implements OnInit, OnDestroy {
  private chatSvc = inject(ChatService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  abierto = false;
  convId: number | null = null;
  sessionToken = '';
  nombre = '';
  email = '';
  cedula = '';
  mensajes: ChatMsg[] = [];
  nuevoMensaje = '';
  cargando = false;
  finalizada = false;
  errorChat = '';
  private polling: any = null;

  ngOnInit() {
    const stored = localStorage.getItem('chat_conv');
    if (stored) {
      const parsed = JSON.parse(stored);
      const user = this.auth.usuario();
      if (user) {
        if (parsed.id_usuario === user.id) {
          this.convId = parsed.convId;
          this.sessionToken = parsed.sessionToken;
        }
      } else {
        this.convId = parsed.convId;
        this.sessionToken = parsed.sessionToken;
      }
    }
  }

  abrir() {
    this.abierto = true;
    if (this.convId) this.recargar();
    this.iniciarPolling();
  }

  cerrar() {
    this.abierto = false;
    this.detenerPolling();
  }

  ngOnDestroy() {
    this.detenerPolling();
  }

  private iniciarPolling() {
    this.detenerPolling();
    if (!this.convId) return;
    this.polling = setInterval(() => {
      if (!this.convId || this.finalizada) return;
      this.chatSvc.obtenerConv(this.convId, this.sessionToken).subscribe({
        next: c => {
          this.mensajes = c.mensajes;
          this.finalizada = c.estado === 'finalizado';
          this.cdr.detectChanges();
        }
      });
    }, 4000);
  }

  private detenerPolling() {
    if (this.polling) {
      clearInterval(this.polling);
      this.polling = null;
    }
  }

  nuevaConversacion() {
    this.limpiarConv();
  }

  recargar() {
    this.chatSvc.obtenerConv(this.convId!, this.sessionToken).subscribe({
      next: c => {
        this.mensajes = c.mensajes;
        this.nombre = c.nombre;
        this.finalizada = c.estado === 'finalizado';
        this.cdr.detectChanges();
      },
      error: () => {
        this.limpiarConv();
        this.cdr.detectChanges();
      }
    });
  }

  limpiarConv() {
    this.convId = null;
    this.sessionToken = '';
    this.mensajes = [];
    this.nuevoMensaje = '';
    this.finalizada = false;
    this.errorChat = '';
    localStorage.removeItem('chat_conv');
  }

  iniciarConv() {
    this.cargando = true;
    const user = this.auth.usuario();
    const data = {
      nombre: this.nombre,
      email: user?.email || this.email,
      cedula: user?.cedula || this.cedula,
    };
    this.chatSvc.crearConv(data).subscribe({
      next: r => {
        this.convId = r.id;
        this.sessionToken = r.session_token;
        this.errorChat = '';
        localStorage.setItem('chat_conv', JSON.stringify({
          convId: r.id, sessionToken: r.session_token,
          id_usuario: user?.id || null
        }));
        this.iniciarPolling();
        this.chatSvc.enviarMensaje(r.id, 'Hola, necesito ayuda', r.session_token).subscribe({
          next: msg => {
            this.mensajes = [msg];
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: e => {
        this.errorChat = e.error?.detail || 'Error al iniciar conversación. Intenta de nuevo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  enviarMsg() {
    if (!this.nuevoMensaje.trim() || !this.convId || this.finalizada) return;
    this.cargando = true;
    this.chatSvc.enviarMensaje(this.convId, this.nuevoMensaje, this.sessionToken).subscribe({
      next: msg => {
        this.mensajes.push(msg);
        this.nuevoMensaje = '';
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => this.cargando = false
    });
  }
}
