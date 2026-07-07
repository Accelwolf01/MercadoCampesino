import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { ChatWidget } from './components/chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, ChatWidget],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer class="bg-dark text-center text-light small py-4 px-3" style="border-top:3px solid var(--amarillo);">
      <p class="mb-1 fw-semibold" style="color:var(--amarillo);">MercadoCampesino — Plataforma gratuita de conexión</p>
      <p class="mb-0 text-white-50" style="max-width:800px;margin:0 auto;">
        MercadoCampesino es una plataforma gratuita que <strong>conecta</strong> campesinos de Cundinamarca con consumidores de Bogotá.
        <strong>No realizamos transacciones</strong>, no cobramos comisiones ni tenemos responsabilidad sobre los acuerdos entre las partes.
        El pago, la entrega y la calidad de los productos se acuerdan <strong>directamente entre campesino y consumidor</strong>.
        Al usar nuestros servicios aceptas estos términos.
        <span class="d-block mt-2">▸ Recomendamos usar <strong>MercadoPago</strong> o plataformas de depósito en garantía para proteger a ambas partes, pero no es obligatorio — es solo una sugerencia.</span>
      </p>
    </footer>
    <app-chat-widget></app-chat-widget>
  `,
  styles: [`
    main { min-height: calc(100vh - 56px - 130px); }
  `]
})
export class App {}
