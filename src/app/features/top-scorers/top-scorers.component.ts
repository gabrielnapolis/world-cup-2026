import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldCupService } from '../../core/services/world-cup.service';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import {RouterLink} from '@angular/router';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-top-scorers',
  standalone: true,
  imports: [CommonModule, Card, Tag, RouterLink, SearchInputComponent],
  templateUrl: './top-scorers.component.html'
})
export class TopScorersComponent {
  worldCupService = inject(WorldCupService);
  topScorers = this.worldCupService.topScorers;

  searchTerm = signal<string>('');

  filteredScorers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allScorers = this.topScorers();

    if (!term) return allScorers;

    return allScorers.filter(scorer =>
      scorer.name.toLowerCase().includes(term) ||
      scorer.team.name.toLowerCase().includes(term)
    );
  });

  limit = signal(8);

  visibleScorers = computed(() => {
    return this.filteredScorers().slice(0, this.limit());
  });

  hasMore = computed(() => {
    return this.filteredScorers().length > this.limit();
  });

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.hasMore()) {
      const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
      const max = document.documentElement.scrollHeight;
      if (pos >= max - 200) {
        this.loadMore();
      }
    }
  }

  loadMore() {
    this.limit.update(val => val + 8);
  }
}
