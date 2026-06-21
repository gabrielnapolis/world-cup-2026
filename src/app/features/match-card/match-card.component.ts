import { Component, computed, input } from '@angular/core';
import { Match } from '../../core/models/match.model';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, Card, Tag, Divider, Dialog, Button, RouterLink],
  templateUrl: 'match-card.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MatchCardComponent {
  match = input.required<Match>();

  goalsDialogVisible = false;

  CAZE_TV = 'www.youtube.com/@CazeTV/streams';

  statusSeverity = computed(() => {
    switch (this.match().status) {
      case 'Passando Agora': return 'success';
      case 'Em Breve': return 'warn';
      case 'Hoje': return 'success';
      case 'Amanhã': return 'info';
      case 'Encerrado': return 'secondary';
      default: return 'contrast';
    }
  });

  showGoals() {
    this.goalsDialogVisible = true;
  }

  openLink():void {
    window.open(`https://${this.CAZE_TV}`, '_blank');
  }
}
