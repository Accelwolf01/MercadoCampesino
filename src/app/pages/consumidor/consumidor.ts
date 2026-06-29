import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface Categoria { id: number; nombre: string; }
interface Producto { id: number; nombre: string; id_categoria: number | null; categoria?: Categoria; unidad: string; foto_url: string | null; activo: boolean; }
interface Plaza { id: number; nombre: string; direccion: string | null; activo: boolean; }
interface ViajeUbicacion { id: number; id_plaza?: number | null; plaza?: Plaza | null; latitud: number; longitud: number; direccion: string | null; activa: boolean; }
interface CampesinoInfo { id: number; nombres: string; apellidos: string; }
interface ViajeProducto { id: number; id_producto: number; producto?: Producto; precio: number; cantidad_inicial: number; cantidad_disponible: number; activo: boolean; fotos: any[]; ofertas: any[]; viaje?: Viaje; }
interface Viaje { id: number; id_campesino: number; campesino?: CampesinoInfo; fecha_viaje: string; hora_inicio: string | null; hora_fin: string | null; notas: string | null; activo: boolean; ubicaciones: ViajeUbicacion[]; productos: ViajeProducto[]; }
interface Preorden { id: number; id_viaje_producto: number; cantidad: number; estado: string; created_at: string; viaje_producto?: ViajeProducto; }
interface Resenia { id: number; id_autor: number; id_destino: number; id_viaje: number | null; puntuacion: number; comentario: string | null; respuesta: string | null; reportada: boolean; created_at: string; autor?: { nombres: string; apellidos: string; }; destino?: { nombres: string; apellidos: string; }; }

@Component({
  selector: 'app-consumidor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consumidor.html'
})
export class Consumidor implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  tab = 'explorar';

  categorias: Categoria[] = [];
  plazas: Plaza[] = [];
  viajes: Viaje[] = [];
  cargando = true;
  searchTerm = '';
  filtroCategoria: number | null = null;
  filtroPlaza: number | null = null;

  preordenes: Preorden[] = [];
  preordenCantidad: { [vpId: number]: number } = {};
  preordenMensaje = '';

  resenias: Resenia[] = [];
  campesinos: CampesinoInfo[] = [];
  nuevaResenia = { id_destino: null as number | null, puntuacion: 5, comentario: '' };
  reseniaMensaje = '';
  cargandoResenia = false;

  mensaje = '';
  error = '';

  ngOnInit() {
    this.cargarCategorias();
    this.cargarPlazas();
    this.cargarViajes();
    this.cargarPreordenes();
    this.cargarResenias();
  }

  cargarCategorias() {
    this.api.get<Categoria[]>('/categorias').subscribe({
      next: r => this.categorias = r
    });
  }

  cargarPlazas() {
    this.api.get<Plaza[]>('/plazas').subscribe({
      next: r => this.plazas = r
    });
  }

  cargarViajes() {
    this.cargando = true;
    this.cdr.detectChanges();
    this.api.get<Viaje[]>('/viajes/activos').subscribe({
      next: r => {
        this.viajes = r;
        for (const v of r) {
          for (const vp of v.productos || []) {
            if (!this.preordenCantidad[vp.id]) {
              this.preordenCantidad[vp.id] = 1;
            }
          }
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Error al cargar productos'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  cargarPreordenes() {
    this.api.get<Preorden[]>('/preordenes').subscribe({
      next: r => { this.preordenes = r; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  cargarResenias() {
    this.api.get<Resenia[]>('/resenias/mis-resenias').subscribe({
      next: r => { this.resenias = r; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.api.get<CampesinoInfo[]>('/resenias/campesinos-activos').subscribe({
      next: r => {
        const user = this.auth.usuario();
        this.campesinos = r.filter(c => c.id !== user?.id);
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  get plazasConViajes(): (Plaza & { viajes: Viaje[]; totalProductos: number })[] {
    const map = new Map<number, Plaza & { viajes: Viaje[]; totalProductos: number }>();
    for (const v of this.viajes) {
      const ubi = v.ubicaciones?.find(u => u.activa) || v.ubicaciones?.[0];
      if (!ubi?.plaza) continue;
      const p = ubi.plaza;
      if (!map.has(p.id)) map.set(p.id, { ...p, viajes: [], totalProductos: 0 });
      const entry = map.get(p.id)!;
      entry.viajes.push(v);
      entry.totalProductos += (v.productos || []).filter(x => x.activo).length;
    }
    return Array.from(map.values()).sort((a, b) => b.totalProductos - a.totalProductos);
  }

  get gruposPorPlaza(): { plaza: Plaza; campesinos: { viaje: Viaje; items: ViajeProducto[] }[] }[] {
    const plazas = new Map<number, { plaza: Plaza; campesinos: Map<number, { viaje: Viaje; items: ViajeProducto[] }> }>();
    for (const v of this.viajes) {
      const ubi = v.ubicaciones?.find(u => u.activa) || v.ubicaciones?.[0];
      if (!ubi?.plaza) continue;
      const p = ubi.plaza;
      if (this.filtroPlaza && p.id !== this.filtroPlaza) continue;
      if (!plazas.has(p.id)) plazas.set(p.id, { plaza: p, campesinos: new Map() });
      const entry = plazas.get(p.id)!;
      const cId = v.campesino?.id || v.id_campesino;
      if (!entry.campesinos.has(cId)) entry.campesinos.set(cId, { viaje: v, items: [] });
      const camp = entry.campesinos.get(cId)!;
      for (const vp of v.productos || []) {
        if (!vp.activo) continue;
        if (!vp.producto) continue;
        if (this.filtroCategoria && vp.producto.id_categoria !== this.filtroCategoria) continue;
        if (this.searchTerm && !vp.producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())) continue;
        camp.items.push(vp);
      }
    }
    return Array.from(plazas.values()).map(p => ({
      plaza: p.plaza,
      campesinos: Array.from(p.campesinos.values()).filter(c => c.items.length > 0)
    })).filter(g => g.campesinos.length > 0);
  }

  get totalProductosVisibles(): number {
    let count = 0;
    for (const g of this.gruposPorPlaza) {
      for (const c of g.campesinos) count += c.items.length;
    }
    return count;
  }

  get plazaNombre() {
    return (v: Viaje | undefined) => {
      if (!v) return 'Ubicación no disponible';
      const ubi = v.ubicaciones?.find(u => u.activa) || v.ubicaciones?.[0];
      return ubi?.plaza?.nombre || ubi?.direccion || 'Ubicación no disponible';
    };
  }

  get ubicacionPlaza() {
    return (p: Plaza | undefined) => p?.direccion || '';
  }

  get campesinosDisponibles(): CampesinoInfo[] {
    const map = new Map<number, CampesinoInfo>();
    for (const v of this.viajes) {
      if (v.campesino) map.set(v.campesino.id, v.campesino);
    }
    return Array.from(map.values());
  }

  crearPreorden(vp: ViajeProducto) {
    const cantidad = this.preordenCantidad[vp.id];
    if (!cantidad || cantidad <= 0) {
      this.preordenMensaje = 'Cantidad inválida';
      return;
    }
    if (cantidad > vp.cantidad_disponible) {
      this.preordenMensaje = `Solo hay ${vp.cantidad_disponible} disponibles`;
      return;
    }
    this.api.post<Preorden>('/preordenes', { id_viaje_producto: vp.id, cantidad }).subscribe({
      next: () => {
        this.preordenMensaje = 'Preorden creada exitosamente';
        this.cargarPreordenes();
        this.cargarViajes();
      },
      error: e => this.preordenMensaje = e.error?.detail || 'Error al crear preorden'
    });
  }

  cancelarPreorden(id: number) {
    if (!confirm('¿Cancelar esta preorden?')) return;
    this.api.put<Preorden>(`/preordenes/${id}/cancelar`).subscribe({
      next: () => {
        this.cargarPreordenes();
        this.cargarViajes();
      },
      error: e => this.error = e.error?.detail || 'Error al cancelar'
    });
  }

  enviarResenia() {
    if (this.cargandoResenia) return;
    if (!this.nuevaResenia.id_destino) {
      this.reseniaMensaje = 'Selecciona un campesino';
      return;
    }
    if (!this.nuevaResenia.comentario.trim()) {
      this.reseniaMensaje = 'Escribe un comentario';
      return;
    }
    this.cargandoResenia = true;
    this.reseniaMensaje = 'Publicando reseña...';
    this.api.post<Resenia>('/resenias', {
      id_destino: this.nuevaResenia.id_destino,
      puntuacion: this.nuevaResenia.puntuacion,
      comentario: this.nuevaResenia.comentario.trim()
    }).subscribe({
      next: () => {
        this.reseniaMensaje = 'Reseña publicada';
        this.nuevaResenia = { id_destino: null, puntuacion: 5, comentario: '' };
        this.cargandoResenia = false;
        this.cargarResenias();
      },
      error: e => {
        this.reseniaMensaje = e.error?.detail || 'Error al publicar reseña';
        this.cargandoResenia = false;
      }
    });
  }

  estadoClass(e: string): string {
    const map: Record<string, string> = {
      pendiente: 'badge badge-amarillo',
      entregado: 'badge badge-verde',
      cancelado: 'badge',
      no_retiro: 'badge badge-rojo'
    };
    return map[e] || 'badge';
  }

  get ubicacionPrincipal() {
    return (v: Viaje) => v.ubicaciones?.[0]?.direccion || 'Ubicación no disponible';
  }

  get campesinoNombre() {
    return (v: Viaje) => v.campesino ? `${v.campesino.nombres} ${v.campesino.apellidos}` : 'Campesino';
  }

  trackById(_: number, item: any) { return item.id; }

  limpiarMensajes() {
    this.mensaje = '';
    this.error = '';
    this.preordenMensaje = '';
    this.reseniaMensaje = '';
  }
}
