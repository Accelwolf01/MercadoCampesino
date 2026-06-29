import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface OfertaActiva {
  id: number;
  descuento_porcentaje: number;
  precio_oferta: number;
  cantidad_limite: number | null;
  viaje_producto: {
    id: number;
    precio: number;
    cantidad_disponible: number;
    producto: { id: number; nombre: string; foto_url: string | null; unidad: string; };
    viaje: {
      id: number;
      fecha_viaje: string;
      notas: string;
      ubicaciones: { latitud: number; longitud: number; direccion: string; foto_url: string | null; }[];
      campesino: { id: number; nombres: string; apellidos: string; };
    };
  };
}

interface CampesinoInfo { id: number; nombres: string; apellidos: string; }
interface ReseniaPub { id: number; puntuacion: number; comentario: string | null; created_at: string; autor: { nombres: string; apellidos: string; }; }

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  ofertas: OfertaActiva[] = [];
  viajes: any[] = [];
  error = '';
  campesinos: CampesinoInfo[] = [];
  campesinoSeleccionado: number | null = null;
  reseniasPublicas: ReseniaPub[] = [];
  cargandoReseniasPub = false;

  ngOnInit() {
    this.api.get<OfertaActiva[]>('/ofertas/activas').subscribe({
      next: r => { this.ofertas = r; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });
    this.api.get<any[]>('/viajes/activos').subscribe({
      next: r => { this.viajes = r; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });
    this.api.get<CampesinoInfo[]>('/resenias/campesinos-activos').subscribe({
      next: r => { this.campesinos = r; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });
  }

  cargarReseniasPublicas() {
    if (!this.campesinoSeleccionado) return;
    this.cargandoReseniasPub = true;
    this.reseniasPublicas = [];
    this.api.get<ReseniaPub[]>(`/resenias/usuario/${this.campesinoSeleccionado}`).subscribe({
      next: r => { this.reseniasPublicas = r; this.cargandoReseniasPub = false; this.cdr.detectChanges(); },
      error: () => { this.cargandoReseniasPub = false; this.cdr.detectChanges(); }
    });
  }

  get productosDisponibles() {
    const items: any[] = [];
    for (const v of this.viajes) {
      for (const vp of (v.productos || [])) {
        if (vp.activo && vp.cantidad_disponible > 0) {
          items.push({
            id: vp.id,
            nombre: vp.producto?.nombre || 'Producto',
            precio: vp.precio,
            unidad: vp.producto?.unidad || '',
            foto_url: vp.producto?.foto_url || null,
            disponible: vp.cantidad_disponible,
            inicial: vp.cantidad_inicial,
            campesino: `${v.campesino?.nombres || ''} ${v.campesino?.apellidos || ''}`,
            direccion: v.ubicaciones?.[0]?.direccion || 'Ver en mapa',
            id_viaje: v.id
          });
        }
      }
    }
    return items;
  }
}