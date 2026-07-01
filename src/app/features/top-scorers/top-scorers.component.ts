import { Component, inject, signal, computed, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldCupService } from '../../core/services/world-cup.service';
import { PlayerPhotoService } from '../../core/services/player-photo.service';
import { Card } from 'primeng/card';
import { RouterLink } from '@angular/router';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { Avatar } from 'primeng/avatar';
import { Skeleton } from 'primeng/skeleton';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-top-scorers',
  standalone: true,
  imports: [CommonModule, Card, RouterLink, SearchInputComponent, Avatar, Skeleton],
  templateUrl: './top-scorers.component.html'
})
export class TopScorersComponent {
  worldCupService = inject(WorldCupService);
  playerPhotoService = inject(PlayerPhotoService);
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

  limit = signal(4);

  visibleScorers = computed(() => {
    return this.filteredScorers().slice(0, this.limit());
  });

  hasMore = computed(() => {
    return this.filteredScorers().length > this.limit();
  });

  photoState = signal<Record<string, { loading: boolean, url: string | null }>>({});

  constructor() {
    effect(() => {
      const scorers = this.visibleScorers();
      const currentState = this.photoState();

      const toFetch = scorers.filter(s => currentState[s.name] === undefined);

      if (toFetch.length > 0) {
        this.photoState.update(state => {
          const newState = { ...state };
          toFetch.forEach(s => {
            newState[s.name] = { loading: true, url: null };
          });
          return newState;
        });

        const requests = toFetch.map(s =>
          this.playerPhotoService.getPhoto(s.name).pipe(
            catchError(() => of(null))
          )
        );

        if (requests.length > 0) {
          forkJoin(requests).subscribe(results => {
            this.photoState.update(state => {
              const newState = { ...state };
              toFetch.forEach((s, index) => {
                newState[s.name] = { loading: false, url: results[index] };
              });
              return newState;
            });
          });
        }
      }
    });
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.hasMore()) {
      const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
      const max = document.documentElement.scrollHeight;
      if (pos >= max - 50) {
        setTimeout(() => {
          this.loadMore();
        }, 2000)
      }
    }
  }

  loadMore() {
    this.limit.update(val => val + 2);
  }
}
