import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldCupService } from '../../core/services/world-cup.service';
import { GroupResult } from '../../core/models/match.model';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { GroupHistoryCardComponent } from '../group-history-card/group-history-card.component';
import { Match } from '../../core/models/match.model';
import { RouterLink } from '@angular/router';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-group-stage',
  standalone: true,
  imports: [CommonModule, TableModule, Button, Dialog, GroupHistoryCardComponent, RouterLink, SearchInputComponent],
  templateUrl: 'group-stage.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class GroupStageComponent implements OnInit {
  private worldCupService = inject(WorldCupService);

  loading = this.worldCupService.loading;

  historyDialogVisible = false;
  selectedGroup = signal<string>('');
  selectedGroupMatches = signal<Match[]>([]);

  // Computes the standings from all matches
  groupStandings = computed(() => {
    const matches = this.worldCupService.matches();
    const groupMatches = matches.filter(m => m.group);

    // Group by groupName
    const groupsMap = new Map<string, Map<string, GroupResult>>();

    groupMatches.forEach(match => {
      if (!match.group) return;

      if (!groupsMap.has(match.group)) {
        groupsMap.set(match.group, new Map());
      }
      const teamMap = groupsMap.get(match.group)!;

      // Initialize team1 if not exists
      if (!teamMap.has(match.team1.name)) {
        teamMap.set(match.team1.name, this.createEmptyResult(match.team1));
      }
      // Initialize team2 if not exists
      if (!teamMap.has(match.team2.name)) {
        teamMap.set(match.team2.name, this.createEmptyResult(match.team2));
      }

      const t1Result = teamMap.get(match.team1.name)!;
      const t2Result = teamMap.get(match.team2.name)!;

      // If match is finished, calculate points
      if (match.score && match.score.ft) {
        const [gf1, gf2] = match.score.ft;

        t1Result.played++;
        t1Result.goalsFor += gf1;
        t1Result.goalsAgainst += gf2;
        t1Result.goalDifference = t1Result.goalsFor - t1Result.goalsAgainst;

        t2Result.played++;
        t2Result.goalsFor += gf2;
        t2Result.goalsAgainst += gf1;
        t2Result.goalDifference = t2Result.goalsFor - t2Result.goalsAgainst;

        if (gf1 > gf2) {
          t1Result.won++;
          t1Result.points += 3;
          t2Result.lost++;
        } else if (gf1 < gf2) {
          t2Result.won++;
          t2Result.points += 3;
          t1Result.lost++;
        } else {
          t1Result.drawn++;
          t2Result.drawn++;
          t1Result.points += 1;
          t2Result.points += 1;
        }
      }
    });

    const finalStandings = Array.from(groupsMap.entries()).map(([groupName, teamMap]) => {
      const results = Array.from(teamMap.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.team.name.localeCompare(b.team.name); // alphabet fallback
      });

      return { groupName, results };
    });

    // Sort groups alphabetically (Group A, Group B...)
    finalStandings.sort((a, b) => a.groupName.localeCompare(b.groupName));

    return finalStandings;
  });

  searchTerm = signal<string>('');

  filteredStandings = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const standings = this.groupStandings();

    if (!term) return standings;

    return standings.filter(group =>
      group.results.some(result =>
        result.team.name.toLowerCase().includes(term)
      )
    );
  });

  limit = signal<number>(4);

  visibleGroups = computed(() => {
    return this.filteredStandings().slice(0, this.limit());
  });

  hasMoreGroups = computed(() => {
    return this.filteredStandings().length > this.limit();
  });

  loadMore() {
    this.limit.update(val => val + 4);
  }

  showHistory(groupName: string) {
    const matches = this.worldCupService.matches().filter(m => m.group === groupName);
    this.selectedGroupMatches.set(matches);
    this.selectedGroup.set(groupName);
    this.historyDialogVisible = true;
  }

  ngOnInit() {
    if (this.worldCupService.matches().length === 0) {
      this.worldCupService.loadMatches();
    }
  }

  private createEmptyResult(team: any): GroupResult {
    return {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
  }
}
