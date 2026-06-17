import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldCupService } from '../../core/services/world-cup.service';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-top-scorers',
  standalone: true,
  imports: [CommonModule, Card, Tag, Button],
  templateUrl: './top-scorers.component.html'
})
export class TopScorersComponent {
  worldCupService = inject(WorldCupService);
  topScorers = this.worldCupService.topScorers;

  limit = signal(4);
  
  visibleScorers = computed(() => {
    return this.topScorers().slice(0, this.limit());
  });

  hasMore = computed(() => {
    return this.topScorers().length > this.limit();
  });

  loadMore() {
    this.limit.update(val => val + 4);
  }
}
