import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-viaje',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="viaje-container">
      <h1>Gestionar viaje</h1>
      <p class="empty">Componente de viaje en construcción</p>
    </div>
  `,
  styles: [`
    .viaje-container { max-width: 900px; margin: 0 auto; padding: 1.5rem; }
    h1 { color: #c62828; }
    .empty { color: #999; font-style: italic; text-align: center; padding: 2rem; }
  `]
})
export class Viaje implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  ngOnInit() {}
}
