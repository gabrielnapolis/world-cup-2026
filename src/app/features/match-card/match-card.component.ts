import { Component, computed, input } from '@angular/core';
import { Match, MatchStatus } from '../../core/models/match.model';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, Card, Tag, Divider, Dialog, Button],
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

  MatchStatus = MatchStatus;

  statusSeverity = computed(() => {
    switch (this.match().status) {
      case MatchStatus.LIVE: return 'success';
      case MatchStatus.SOON: return 'warn';
      case MatchStatus.TODAY: return 'success';
      case MatchStatus.TOMORROW: return 'contrast';
      case MatchStatus.FINISHED: return 'secondary';
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
