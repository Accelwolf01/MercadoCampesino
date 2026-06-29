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
    <app-chat-widget></app-chat-widget>
  `,
  styles: [`
    main { min-height: calc(100vh - 56px); }
  `]
})
export class App {}
