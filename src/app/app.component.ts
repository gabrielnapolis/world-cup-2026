import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-surface-950 text-surface-0 font-sans">
      <nav class="bg-surface-900 border-b border-surface-800 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="pi pi-globe text-primary-400 text-2xl"></i>
            <span class="font-bold text-xl tracking-tight">Copa 2026</span>
          </div>
          
          <div class="flex gap-1">
            <a routerLink="/schedule" routerLinkActive="bg-surface-800 text-primary-300" class="px-4 py-2 rounded-md font-medium text-surface-200 hover:bg-surface-800 transition-colors">
              Jogos
            </a>
            <a routerLink="/groups" routerLinkActive="bg-surface-800 text-primary-300" class="px-4 py-2 rounded-md font-medium text-surface-200 hover:bg-surface-800 transition-colors">
              Grupos
            </a>
          </div>
        </div>
      </nav>

      <main class="py-6">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="bg-surface-900 border-t border-surface-800 py-6 text-center text-surface-400 text-sm mt-auto">
        <p>Dados não-oficiais via openfootball API</p>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'world-cup';
}
