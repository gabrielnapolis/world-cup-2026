import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../../core/models/match.model';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-group-history-card',
  standalone: true,
  imports: [CommonModule, Card, Tag],
  templateUrl: 'group-history-card.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class GroupHistoryCardComponent {
  match = input.required<Match>();

  statusSeverity = computed(() => {
    switch (this.match().status) {
      case 'Passando Agora': return 'success';
      case 'Hoje': return 'success';
      case 'Amanhã': return 'info';
      case 'Encerrado': return 'secondary';
      default: return 'contrast';
    }
  });
}
