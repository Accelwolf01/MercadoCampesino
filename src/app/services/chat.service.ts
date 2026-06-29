import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface ChatConv {
  id: number; nombre: string; email: string; cedula: string;
  id_usuario: number | null; session_token: string;
  estado: string; id_admin_asignado: number | null;
  created_at: string; updated_at: string | null;
  mensajes: ChatMsg[];
}

export interface ChatConvMini {
  id: number; nombre: string; email: string; cedula: string;
  estado: string; id_admin_asignado: number | null;
  created_at: string; updated_at: string | null;
}

export interface ChatMsg {
  id: number; id_conversacion: number; mensaje: string;
  es_admin: boolean; id_admin: number | null; created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers() {
    const t = this.auth.token();
    return t ? new HttpHeaders({ 'Authorization': `Bearer ${t}` }) : undefined;
  }

  crearConv(data: { nombre: string; email: string; cedula: string }) {
    return this.http.post<{ id: number; session_token: string }>(
      `${environment.apiUrl}/chat/conversaciones`, data, { headers: this.headers() }
    );
  }

  enviarMensaje(convId: number, mensaje: string, token: string) {
    const url = `${environment.apiUrl}/chat/conversaciones/${convId}/mensajes?token=${token}`;
    return this.http.post<ChatMsg>(url, { mensaje }, { headers: this.headers() });
  }

  obtenerConv(convId: number, token: string) {
    const url = `${environment.apiUrl}/chat/conversaciones/${convId}?token=${token}`;
    return this.http.get<ChatConv>(url, { headers: this.headers() });
  }

  pendientes() {
    return this.http.get<ChatConvMini[]>(`${environment.apiUrl}/chat/admin/pendientes`, { headers: this.headers() });
  }

  asignadas() {
    return this.http.get<ChatConvMini[]>(`${environment.apiUrl}/chat/admin/asignadas`, { headers: this.headers() });
  }

  historial() {
    return this.http.get<ChatConvMini[]>(`${environment.apiUrl}/chat/admin/historial`, { headers: this.headers() });
  }

  tomar(convId: number) {
    return this.http.put<any>(`${environment.apiUrl}/chat/admin/${convId}/tomar`, {}, { headers: this.headers() });
  }

  responderAdmin(convId: number, mensaje: string) {
    return this.http.post<ChatMsg>(`${environment.apiUrl}/chat/admin/${convId}/mensajes`, { mensaje }, { headers: this.headers() });
  }

  finalizar(convId: number) {
    return this.http.put<any>(`${environment.apiUrl}/chat/admin/${convId}/finalizar`, {}, { headers: this.headers() });
  }
}
