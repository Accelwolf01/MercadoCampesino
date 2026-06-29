import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface Categoria { id: number; nombre: string; }
interface Plaza { id: number; nombre: string; direccion: string | null; latitud: number | null; longitud: number | null; activo: boolean; }
interface Producto { id: number; nombre: string; id_categoria: number | null; id_creador: number | null; categoria?: Categoria; unidad: string; precio: number | null; foto_url: string | null; activo: boolean; }
interface ViajeUbicacion { id: number; id_plaza?: number | null; plaza?: Plaza | null; latitud: number; longitud: number; direccion: string | null; foto_url: string | null; activa: boolean; }
interface ViajeProducto { id: number; id_viaje: number; id_producto: number; producto?: Producto; precio: number; cantidad_inicial: number; cantidad_disponible: number; activo: boolean; fotos: any[]; ofertas: any[]; }
interface Viaje { id: number; id_campesino: number; fecha_viaje: string; hora_inicio: string | null; hora_fin: string | null; notas: string | null; activo: boolean; ubicaciones: ViajeUbicacion[]; productos: ViajeProducto[]; }
interface Oferta { id: number; id_viaje_producto: number; descuento_porcentaje: number; precio_oferta: number; cantidad_limite: number | null; activa: boolean; viaje_producto?: { id: number; precio: number; producto?: { id: number; nombre: string; foto_url: string | null; unidad: string; }; }; }

interface ProductoSeleccionado { id_producto: number; nombre: string; unidad: string; precio: number | null; cantidad_inicial: number; }

@Component({
  selector: 'app-campesino',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './campesino.html'
})
export class Campesino implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  tab = 'productos';

  categorias: Categoria[] = [];
  plazas: Plaza[] = [];
  misProductos: Producto[] = [];
  viajes: Viaje[] = [];
  ofertas: Oferta[] = [];
  viajesParaOfertas: Viaje[] = [];
  cargandoViajes = true;
  cargandoOfertas = true;

  nuevoProducto = { nombre: '', id_categoria: null as number | null, unidad: 'kg', precio: null as number | null, foto_base64: '' as string };
  editandoId: number | null = null;
  editForm = { nombre: '', id_categoria: null as number | null, unidad: 'kg', precio: null as number | null, foto_base64: '' as string };
  guardando = false;
  guardandoEdit = false;

  viajeForm = {
    fecha: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }),
    hora_inicio: '',
    hora_fin: '',
    notas: '',
    id_plaza: null as number | null,
    foto_url: '' as string
  };
  viajeProductos: ProductoSeleccionado[] = [];
  creandoViaje = false;

  ofertaForm = { id_viaje: null as number | null, id_vp: null as number | null, descuento: 10, cantidad_limite: null as number | null };
  activandoOferta = false;
  editandoOfertaId: number | null = null;
  editOfertaForm = { descuento: 10, cantidad_limite: null as number | null };

  reprogramandoViajeId: number | null = null;
  reprogramarForm = { fecha: '', hora_inicio: '', hora_fin: '' };

  editandoUbicacionViajeId: number | null = null;
  editUbicacionForm = { id_plaza: null as number | null, foto_url: '' };

  agregarProductoViajeId: number | null = null;
  productoAViajeTemp = { id_producto: 0, cantidad: 1 };

  fotoCedulaBase64 = '';
  fotoUbicacionBase64 = '';

  viajeExpandido: number | null = null;

  mensaje = '';
  error = '';

  ngOnInit() {
    this.cargarCategorias();
    this.cargarPlazas();
    this.cargarMisProductos();
    this.cargarViajes();
    this.cargarOfertas();
  }

  cargarCategorias() {
    this.api.get<Categoria[]>('/categorias').subscribe({
      next: r => this.categorias = r,
      error: () => this.error = 'Error al cargar categorías'
    });
  }

  cargarPlazas() {
    this.api.get<Plaza[]>('/plazas').subscribe({
      next: r => this.plazas = r,
      error: () => {}
    });
  }

  cargarMisProductos() {
    this.api.get<Producto[]>('/productos/mis-productos').subscribe({
      next: r => { this.misProductos = r; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  cargarViajes() {
    this.cargandoViajes = true;
    this.cdr.detectChanges();
    this.api.get<Viaje[]>('/viajes/mis-viajes').subscribe({
      next: r => {
        this.viajes = r;
        this.viajesParaOfertas = r.filter(v => v.activo);
        this.cargandoViajes = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargandoViajes = false; this.cdr.detectChanges(); }
    });
  }

  cargarOfertas() {
    this.cargandoOfertas = true;
    this.cdr.detectChanges();
    this.api.get<Oferta[]>('/ofertas/mis-ofertas').subscribe({
      next: r => { this.ofertas = r; this.cargandoOfertas = false; this.cdr.detectChanges(); },
      error: () => { this.cargandoOfertas = false; this.cdr.detectChanges(); }
    });
  }

  onFileSelected(event: Event, target: 'producto' | 'cedula' | 'ubicacion') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'producto') this.nuevoProducto.foto_base64 = result;
      else if (target === 'cedula') this.fotoCedulaBase64 = result;
      else if (target === 'ubicacion') this.viajeForm.foto_url = result;
    };
    reader.readAsDataURL(file);
  }

  agregarProducto() {
    if (!this.nuevoProducto.nombre.trim()) {
      this.error = 'El nombre del producto es obligatorio';
      return;
    }
    const payload: any = {
      nombre: this.nuevoProducto.nombre.trim(),
      id_categoria: this.nuevoProducto.id_categoria,
      unidad: this.nuevoProducto.unidad,
      precio: this.nuevoProducto.precio || null,
      foto_url: this.nuevoProducto.foto_base64 || null
    };
    this.guardando = true;
    this.api.post<Producto>('/productos', payload).subscribe({
      next: creado => {
        this.mensaje = 'Producto agregado correctamente';
        this.nuevoProducto = { nombre: '', id_categoria: null, unidad: 'kg', precio: null, foto_base64: '' };
        this.guardando = false;
        this.misProductos.push(creado);
      },
      error: e => {
        this.error = e.error?.detail || 'Error al agregar producto';
        this.guardando = false;
      }
    });
  }

  editarProducto(p: Producto) {
    this.editandoId = p.id;
    this.editForm = { nombre: p.nombre, id_categoria: p.id_categoria, unidad: p.unidad, precio: p.precio, foto_base64: '' };
  }

  cancelarEdit() {
    this.editandoId = null;
    this.editForm = { nombre: '', id_categoria: null, unidad: 'kg', precio: null, foto_base64: '' };
  }

  onEditFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = () => this.editForm.foto_base64 = reader.result as string;
    reader.readAsDataURL(input.files[0]);
  }

  guardarEdit(id: number) {
    if (!this.editForm.nombre.trim() || this.guardandoEdit) return;
    this.guardandoEdit = true;
    const payload: any = { nombre: this.editForm.nombre.trim(), id_categoria: this.editForm.id_categoria, unidad: this.editForm.unidad, precio: this.editForm.precio || null };
    if (this.editForm.foto_base64) payload.foto_url = this.editForm.foto_base64;
    this.api.put<Producto>(`/productos/${id}`, payload).subscribe({
      next: actualizado => {
        const idx = this.misProductos.findIndex(p => p.id === id);
        if (idx !== -1) this.misProductos[idx] = actualizado;
        this.cancelarEdit();
        this.guardandoEdit = false;
        this.mensaje = 'Producto actualizado';
        this.cdr.detectChanges();
      },
      error: e => {
        this.cancelarEdit();
        this.guardandoEdit = false;
        this.error = e.error?.detail || 'Error al actualizar';
        this.cdr.detectChanges();
      }
    });
  }

  eliminarProducto(id: number) {
    if (!confirm('¿Eliminar permanentemente este producto? Los datos se perderán y no podrá recuperarlos.')) return;
    this.api.delete(`/productos/${id}`).subscribe({
      next: () => { this.mensaje = 'Producto eliminado permanentemente'; this.cargarMisProductos(); },
      error: e => { this.error = e.error?.detail || 'Error al eliminar'; this.cdr.detectChanges(); }
    });
  }

  toggleActivoProducto(p: Producto) {
    const nuevoEstado = !p.activo;
    this.api.put<Producto>(`/productos/${p.id}`, { activo: nuevoEstado }).subscribe({
      next: () => {
        p.activo = nuevoEstado;
        this.mensaje = nuevoEstado ? 'Producto reactivado' : 'Producto desactivado';
        this.cargarViajes();
        this.cdr.detectChanges();
      },
      error: e => { this.error = e.error?.detail || 'Error al cambiar estado'; this.cdr.detectChanges(); }
    });
  }

  toggleProductoEnViaje(p: Producto) {
    const idx = this.viajeProductos.findIndex(x => x.id_producto === p.id);
    if (idx === -1) {
      this.viajeProductos.push({ id_producto: p.id, nombre: p.nombre, unidad: p.unidad, precio: p.precio, cantidad_inicial: 1 });
    } else {
      this.viajeProductos = this.viajeProductos.filter(x => x.id_producto !== p.id);
    }
  }

  get productoSeleccionado() { return (id: number) => this.viajeProductos.some(x => x.id_producto === id); }

  toggleAgregarProductoAViaje(viajeId: number) {
    this.agregarProductoViajeId = this.agregarProductoViajeId === viajeId ? null : viajeId;
    this.productoAViajeTemp = { id_producto: 0, cantidad: 1 };
  }

  productosNoEnViaje(v: any): Producto[] {
    const idsEnViaje = new Set((v.productos || []).map((vp: any) => vp.id_producto));
    return this.misProductos.filter(p => !idsEnViaje.has(p.id));
  }

  toggleProductoAViaje(p: Producto) {
    this.productoAViajeTemp = { id_producto: p.id, cantidad: 1 };
  }

  confirmarAgregarProductoAViaje(viajeId: number) {
    if (!this.productoAViajeTemp.id_producto || this.productoAViajeTemp.cantidad < 1) return;
    const prod = this.misProductos.find(p => p.id === this.productoAViajeTemp.id_producto);
    if (!prod || !prod.precio) { this.error = 'El producto debe tener un precio'; this.cdr.detectChanges(); return; }
    this.api.post(`/viajes/${viajeId}/productos`, {
      id_producto: prod.id,
      precio: prod.precio,
      cantidad_inicial: this.productoAViajeTemp.cantidad
    }).subscribe({
      next: () => {
        this.mensaje = 'Producto agregado al viaje';
        this.agregarProductoViajeId = null;
        this.productoAViajeTemp = { id_producto: 0, cantidad: 1 };
        this.cargarViajes();
      },
      error: e => { this.error = e.error?.detail || 'Error al agregar producto'; this.cdr.detectChanges(); }
    });
  }

  crearViaje() {
    if (this.viajeProductos.length === 0) { this.error = 'Selecciona al menos un producto'; return; }
    const haySinPrecio = this.viajeProductos.some(x => !x.precio || x.precio <= 0);
    if (haySinPrecio) { this.error = 'Todos los productos deben tener un precio mayor a 0'; return; }
    if (!this.viajeForm.id_plaza) { this.error = 'Selecciona una plaza'; return; }
    const sinPrecio = this.viajeProductos.find(x => !x.precio || x.precio <= 0);
    if (sinPrecio) { this.error = `Fija el precio de "${sinPrecio.nombre}"`; return; }

    this.creandoViaje = true;
    const plaza = this.plazas.find(p => p.id === this.viajeForm.id_plaza);
    const payload: any = {
      fecha_viaje: this.viajeForm.fecha,
      hora_inicio: this.viajeForm.hora_inicio || null,
      hora_fin: this.viajeForm.hora_fin || null,
      notas: this.viajeForm.notas || null,
      ubicaciones: [{
        id_plaza: this.viajeForm.id_plaza,
        latitud: plaza?.latitud || 4.6,
        longitud: plaza?.longitud || -74.08,
        direccion: plaza?.direccion || '',
        foto_url: this.viajeForm.foto_url || null
      }],
      productos: this.viajeProductos.map(x => ({
        id_producto: x.id_producto,
        precio: x.precio,
        cantidad_inicial: x.cantidad_inicial
      }))
    };
    this.api.post<Viaje>('/viajes', payload).subscribe({
      next: () => {
        this.mensaje = 'Viaje creado correctamente';
        this.creandoViaje = false;
        this.viajeForm = { fecha: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }), hora_inicio: '', hora_fin: '', notas: '', id_plaza: null, foto_url: '' };
        this.viajeProductos = [];
        this.cargarViajes();
      },
      error: e => { this.error = e.error?.detail || 'Error al crear viaje'; this.creandoViaje = false; }
    });
  }

  desactivarViaje(id: number) {
    if (!confirm('¿Desactivar este viaje?')) return;
    this.api.put<Viaje>(`/viajes/${id}`, { activo: false }).subscribe({
      next: () => { this.cargarViajes(); this.mensaje = 'Viaje desactivado'; },
      error: e => this.error = e.error?.detail || 'Error al desactivar'
    });
  }

  iniciarReprogramar(v: Viaje) {
    this.reprogramandoViajeId = v.id;
    this.reprogramarForm = {
      fecha: v.fecha_viaje,
      hora_inicio: v.hora_inicio || '',
      hora_fin: v.hora_fin || ''
    };
  }

  cancelarReprogramar() {
    this.reprogramandoViajeId = null;
  }

  reprogramarViaje(id: number) {
    const payload: any = { activo: true };
    if (this.reprogramarForm.fecha) payload.fecha_viaje = this.reprogramarForm.fecha;
    payload.hora_inicio = this.reprogramarForm.hora_inicio || null;
    payload.hora_fin = this.reprogramarForm.hora_fin || null;
    this.api.put<Viaje>(`/viajes/${id}`, payload).subscribe({
      next: () => {
        this.mensaje = 'Viaje reprogramado y reactivado';
        this.reprogramandoViajeId = null;
        this.cargarViajes();
      },
      error: e => this.error = e.error?.detail || 'Error al reprogramar'
    });
  }

  toggleEditUbicacion(v: Viaje) {
    if (this.editandoUbicacionViajeId === v.id) {
      this.editandoUbicacionViajeId = null;
      return;
    }
    const ubi = v.ubicaciones?.find(u => u.activa) || v.ubicaciones?.[0];
    this.editUbicacionForm = { id_plaza: ubi?.id_plaza || null, foto_url: '' };
    this.editandoUbicacionViajeId = v.id;
  }

  guardarUbicacion(v: Viaje) {
    const ubi = v.ubicaciones?.find(u => u.activa) || v.ubicaciones?.[0];
    if (!ubi) { this.error = 'No hay ubicación para actualizar'; return; }
    const plaza = this.plazas.find(p => p.id === this.editUbicacionForm.id_plaza);
    const payload: any = {};
    if (this.editUbicacionForm.id_plaza !== ubi.id_plaza) {
      payload.id_plaza = this.editUbicacionForm.id_plaza;
    }
    if (plaza?.latitud !== ubi.latitud || plaza?.longitud !== ubi.longitud) {
      if (plaza?.latitud) payload.latitud = plaza.latitud;
      if (plaza?.longitud) payload.longitud = plaza.longitud;
    }
    if (plaza?.direccion !== ubi.direccion && plaza?.direccion) {
      payload.direccion = plaza.direccion;
    }
    if (Object.keys(payload).length === 0) { this.editandoUbicacionViajeId = null; return; }
    this.api.put<Viaje>(`/viajes/ubicacion/${ubi.id}`, payload).subscribe({
      next: () => {
        this.mensaje = 'Ubicación actualizada';
        this.editandoUbicacionViajeId = null;
        this.cargarViajes();
      },
      error: e => { this.error = e.error?.detail || 'Error al actualizar ubicación'; this.cdr.detectChanges(); }
    });
  }

  retirarProductoViaje(vpId: number) {
    if (!confirm('¿Retirar este producto del viaje? Las ofertas flash asociadas también se eliminarán.')) return;
    this.api.delete(`/viajes/producto/${vpId}`).subscribe({
      next: () => {
        this.mensaje = 'Producto retirado del viaje';
        this.cargarViajes();
      },
      error: e => { this.error = e.error?.detail || 'Error al retirar producto'; this.cdr.detectChanges(); }
    });
  }

  get productosDeViaje() {
    return (v: Viaje) => v.productos?.filter(p => p.activo) || [];
  }

  get productosParaOferta() {
    if (!this.ofertaForm.id_viaje) return [];
    const viaje = this.viajesParaOfertas.find(v => v.id === this.ofertaForm.id_viaje);
    return viaje?.productos?.filter(p => p.activo) || [];
  }

  get ofertaSeleccionPrecio() {
    if (!this.ofertaForm.id_vp) return 0;
    for (const v of this.viajesParaOfertas) {
      const vp = v.productos?.find(p => p.id === this.ofertaForm.id_vp);
      if (vp) return vp.precio;
    }
    return 0;
  }

  get precioOfertaCalculado() {
    return this.ofertaSeleccionPrecio * (100 - this.ofertaForm.descuento) / 100;
  }

  activarOferta() {
    if (!this.ofertaForm.id_vp) { this.error = 'Selecciona un producto'; this.cdr.detectChanges(); return; }
    if (!this.ofertaForm.descuento || this.ofertaForm.descuento < 1 || this.ofertaForm.descuento > 100) {
      this.error = 'El descuento debe estar entre 1% y 100%'; this.cdr.detectChanges(); return;
    }
    this.activandoOferta = true;
    this.cdr.detectChanges();
    this.api.post<Oferta>(`/ofertas/viaje-producto/${this.ofertaForm.id_vp}`, {
      descuento_porcentaje: this.ofertaForm.descuento,
      cantidad_limite: this.ofertaForm.cantidad_limite || null
    }).subscribe({
      next: () => {
        this.mensaje = 'Oferta flash activada';
        this.activandoOferta = false;
        this.ofertaForm = { id_viaje: null, id_vp: null, descuento: 10, cantidad_limite: null };
        this.cargarOfertas();
        this.cdr.detectChanges();
      },
      error: e => { this.error = e.error?.detail || 'Error al activar oferta'; this.activandoOferta = false; this.cdr.detectChanges(); }
    });
  }

  desactivarOferta(id: number) {
    if (!confirm('¿Desactivar esta oferta flash?')) return;
    this.api.put<Oferta>(`/ofertas/${id}/desactivar`).subscribe({
      next: () => { this.cargarOfertas(); this.mensaje = 'Oferta desactivada'; this.cdr.detectChanges(); },
      error: e => { this.error = e.error?.detail || 'Error al desactivar'; this.cdr.detectChanges(); }
    });
  }

  eliminarOferta(id: number) {
    if (!confirm('¿Eliminar permanentemente esta oferta flash?')) return;
    this.api.delete(`/ofertas/${id}`).subscribe({
      next: () => { this.cargarOfertas(); this.mensaje = 'Oferta eliminada'; this.cdr.detectChanges(); },
      error: e => { this.error = e.error?.detail || 'Error al eliminar'; this.cdr.detectChanges(); }
    });
  }

  iniciarEditarOferta(o: Oferta) {
    this.editandoOfertaId = o.id;
    this.editOfertaForm = { descuento: o.descuento_porcentaje, cantidad_limite: o.cantidad_limite };
  }

  cancelarEditarOferta() {
    this.editandoOfertaId = null;
  }

  guardarEditarOferta(id: number) {
    if (!this.editOfertaForm.descuento || this.editOfertaForm.descuento < 1 || this.editOfertaForm.descuento > 100) {
      this.error = 'El descuento debe estar entre 1% y 100%';
      this.cdr.detectChanges();
      return;
    }
    this.api.put<Oferta>(`/ofertas/${id}/editar`, {
      descuento_porcentaje: this.editOfertaForm.descuento,
      cantidad_limite: this.editOfertaForm.cantidad_limite || null
    }).subscribe({
      next: () => {
        this.mensaje = 'Oferta actualizada';
        this.editandoOfertaId = null;
        this.cargarOfertas();
        this.cdr.detectChanges();
      },
      error: e => { this.error = e.error?.detail || 'Error al editar oferta'; this.cdr.detectChanges(); }
    });
  }

  get categoriaNombre() {
    const map = new Map(this.categorias.map(c => [c.id, c.nombre]));
    return (id: number | null | undefined) => id ? map.get(id) || '' : '';
  }

  get plazaNombre() {
    return (v: Viaje) => {
      const ubi = v.ubicaciones?.find(u => u.activa) || v.ubicaciones?.[0];
      return ubi?.plaza?.nombre || ubi?.direccion || 'Sin ubicación';
    };
  }

  get plazaNombrePorId() {
    const map = new Map(this.plazas.filter(p => p.activo).map(p => [p.id, p.nombre]));
    return (id: number | null | undefined) => id ? map.get(id) || '' : '';
  }

  toggleViaje(id: number) { this.viajeExpandido = this.viajeExpandido === id ? null : id; }

  viajeStatus(v: Viaje): string {
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    if (v.fecha_viaje < hoy) return 'expirado';
    if (v.fecha_viaje === hoy && v.hora_fin) {
      const ahora = new Date().toLocaleTimeString('en-CA', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const [h, m, s] = v.hora_fin.split(':').map(Number);
      const [ah, am, as] = ahora.split(':').map(Number);
      const minutosAhora = ah * 60 + am;
      const minutosFin = h * 60 + m;
      if (minutosAhora > minutosFin) return 'expirado';
    }
    return v.activo ? 'activo' : 'inactivo';
  }

  trackById(_: number, item: any) { return item.id; }

  limpiarMensajes() { this.mensaje = ''; this.error = ''; }
}
