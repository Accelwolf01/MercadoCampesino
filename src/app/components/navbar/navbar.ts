import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div class="container">
        <a class="navbar-brand" routerLink="/">
          <i class="bi bi-basket-fill" style="color:var(--amarillo);"></i> MercadoCampesino
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item"><a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Inicio</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/mapa" routerLinkActive="active">Mapa</a></li>
            @if (auth.isLogged) {
              @if (auth.perfil === 1 || auth.perfil === 2) {
                <li class="nav-item"><a class="nav-link" routerLink="/admin" routerLinkActive="active">Admin</a></li>
              }
              @if (auth.perfil === 1) {
                <li class="nav-item"><a class="nav-link" routerLink="/superadmin" routerLinkActive="active">Superadmin</a></li>
              }
              @if (auth.perfil === 1 || auth.perfil === 3) {
                <li class="nav-item"><a class="nav-link" routerLink="/campesino" routerLinkActive="active">Venta</a></li>
              }
              @if (auth.perfil === 1 || auth.perfil === 2 || auth.perfil === 3 || auth.perfil === 4) {
                <li class="nav-item"><a class="nav-link" routerLink="/consumidor" routerLinkActive="active">Compra</a></li>
              }
              <li class="nav-item"><span class="nav-link disabled"><i class="bi bi-person-circle"></i> {{ auth.usuario()?.nombres }}</span></li>
              <li class="nav-item"><a class="nav-link" routerLink="/soporte" routerLinkActive="active" title="Soporte"><i class="bi bi-headset"></i></a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/perfil" routerLinkActive="active" title="Mi perfil"><i class="bi bi-gear"></i></a></li>
              <li class="nav-item"><button class="btn btn-outline-light btn-sm ms-2" (click)="auth.logout()">Salir</button></li>
            } @else {
              <li class="nav-item"><a class="nav-link" routerLink="/login" routerLinkActive="active">Ingresar</a></li>
              <li class="nav-item"><a class="btn btn-warning btn-sm ms-2" routerLink="/register" style="font-weight:600;">Registro</a></li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class Navbar {
  auth = inject(AuthService);
}