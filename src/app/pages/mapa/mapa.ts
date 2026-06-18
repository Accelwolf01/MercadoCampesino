import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="rounded-circle bg-warning d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width:48px;height:48px;">
          <i class="bi bi-map fs-4" style="color:#8e0000;"></i>
        </div>
        <div>
          <h4 class="fw-bold mb-0" style="color:var(--rojo);">Mapa de campesinos</h4>
          <p class="text-muted small mb-0">Encuentra productos frescos cerca de ti en Bogotá</p>
        </div>
      </div>
      <div id="map" class="shadow-sm" style="height:520px;border-radius:16px;border:2px solid var(--amarillo);"></div>
    </div>
  `
})
export class Mapa implements OnInit, AfterViewInit {
  private api = inject(ApiService);
  private map: any;

  ngOnInit() {
    this.cargarMapa();
  }

  ngAfterViewInit() {
    setTimeout(() => this.cargarMapa(), 200);
  }

  cargarMapa() {
    if (this.map) return;
    this.map = L.map('map').setView([4.61, -74.08], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

    this.api.get<any[]>('/viajes/activos').subscribe({
      next: viajes => {
        viajes.forEach(v => {
          const ubi = v.ubicaciones?.[0];
          if (!ubi) return;
          const marker = L.marker([ubi.latitud, ubi.longitud], {
            icon: L.divIcon({
              html: '<span style="background:#c62828;color:#fdd835;border:2px solid #fdd835;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:18px;">🌽</span>',
              className: '', iconSize: [32, 32], iconAnchor: [16, 16]
            })
          }).addTo(this.map);

          const productos = (v.productos || []).map((p: any) =>
            `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">
              ${p.producto?.foto_url ? `<img src="${p.producto.foto_url}" style="width:28px;height:28px;object-fit:cover;border-radius:4px" />` : ''}
              <span><b>${p.producto?.nombre || '?'}</b> $${p.precio} <small style="color:#888">disp:${p.cantidad_disponible}</small></span>
            </div>`
          ).join('');

          const html = `
            <div style="min-width:200px">
              <b>${v.campesino?.nombres || ''} ${v.campesino?.apellidos || ''}</b><br/>
              <small style="color:#888">${ubi.direccion || 'Ubicación libre'}</small>
              ${productos ? '<hr style="margin:6px 0"/>' + productos : '<br/><span style="color:#999">Sin productos</span>'}
            </div>`;
          marker.bindPopup(html);
        });
        if (viajes.length > 0) {
          const ubi = viajes[0].ubicaciones?.[0];
          if (ubi) this.map.setView([ubi.latitud, ubi.longitud], 12);
        }
      },
      error: () => {}
    });
  }
}
