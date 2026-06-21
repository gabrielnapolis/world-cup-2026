import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match, MatchStatus } from '../../core/models/match.model';
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

  MatchStatus = MatchStatus;

  statusSeverity = computed(() => {
    switch (this.match().status) {
      case MatchStatus.LIVE: return 'success';
      case MatchStatus.TODAY: return 'success';
      case MatchStatus.TOMORROW: return 'info';
      case MatchStatus.FINISHED: return 'secondary';
      default: return 'contrast';
    }
  });

  shortDayOfWeek = computed(() => {
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    return days[this.match().localDate.getDay()];
  });
}
