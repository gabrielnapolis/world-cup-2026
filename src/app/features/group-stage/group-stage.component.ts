import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldCupService } from '../../core/services/world-cup.service';
import { GroupResult } from '../../core/models/match.model';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { GroupHistoryCardComponent } from '../group-history-card/group-history-card.component';
import { Match } from '../../core/models/match.model';

@Component({
  selector: 'app-group-stage',
  standalone: true,
  imports: [CommonModule, TableModule, Button, Dialog, GroupHistoryCardComponent],
  template: `
    <div class="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
      <div class="flex justify-center">
        <img src="world-cup-white.png" alt="Copa 2026 Logo" class="w-40 md:w-32" />
      </div>
      <div class="flex justify-center">
        <h1 class="text-xl font-bold m-0">Classificação da Fase de Grupos</h1>
      </div>


      @if (loading()) {
        <div>Carregando...</div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          @for (group of visibleGroups(); track group.groupName) {
            <div class="bg-surface-900 rounded-xl overflow-hidden border border-surface-800">
              <div class="bg-surface-800 px-4 py-3 font-bold text-lg text-primary-400 flex justify-between items-center">
                <span>{{ group.groupName }}</span>
                <p-button severity="help" icon="pi pi-eye" label="Histórico" [text]="true" size="small" (onClick)="showHistory(group.groupName)"></p-button>
              </div>
              <p-table [value]="group.results" [tableStyle]="{ 'min-width': '100%' }" size="small">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Time</th>
                    <th class="text-center" title="Pontos">P</th>
                    <th class="text-center" title="Jogos">J</th>
                    <th class="text-center" title="Vitórias">V</th>
                    <th class="text-center" title="Empates">E</th>
                    <th class="text-center" title="Derrotas">D</th>
                    <th class="text-center" title="Gols Pró">GP</th>
                    <th class="text-center" title="Gols Contra">GC</th>
                    <th class="text-center" title="Saldo de Gols">SG</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-result let-i="rowIndex">
                  <tr [ngClass]="{'bg-green-900/20': i < 2}"> <!-- Destacar classificados (top 2) -->
                    <td class="flex items-center gap-2">
                      <img
                        [src]="'https://flagcdn.com/w20/' + result.team.code + '.png'"
                        [alt]="result.team.name"
                        class="w-5"
                        onerror="this.src='https://flagcdn.com/w20/un.png'"
                      />
                      <span class="">{{ result.team.name }}</span>
                    </td>
                    <td class="text-center font-bold text-primary-300">{{ result.points }}</td>
                    <td class="text-center">{{ result.played }}</td>
                    <td class="text-center">{{ result.won }}</td>
                    <td class="text-center">{{ result.drawn }}</td>
                    <td class="text-center">{{ result.lost }}</td>
                    <td class="text-center">{{ result.goalsFor }}</td>
                    <td class="text-center">{{ result.goalsAgainst }}</td>
                    <td class="text-center">{{ result.goalDifference }}</td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          } @empty {
            <div class="col-span-full text-center text-surface-400">Nenhum dado de grupo encontrado.</div>
          }
        </div>

        @if (hasMoreGroups()) {
          <div class="flex justify-center mt-6">
            <p-button label="Ver mais" icon="pi pi-plus" (onClick)="loadMore()" severity="secondary" rounded />
          </div>
        }

        <div class="mt-6 bg-surface-900 border border-surface-800 rounded-xl p-4 text-sm text-surface-400">
          <h3 class="font-bold text-surface-200 mb-2">Legenda</h3>
          <div class="flex flex-wrap gap-x-6 gap-y-2">
            <span><strong class="text-primary-400">P:</strong> Pontos</span>
            <span><strong class="text-surface-200">J:</strong> Jogos</span>
            <span><strong class="text-surface-200">V:</strong> Vitórias</span>
            <span><strong class="text-surface-200">E:</strong> Empates</span>
            <span><strong class="text-surface-200">D:</strong> Derrotas</span>
            <span><strong class="text-surface-200">GP:</strong> Gols Pró</span>
            <span><strong class="text-surface-200">GC:</strong> Gols Contra</span>
            <span><strong class="text-surface-200">SG:</strong> Saldo de Gols</span>
          </div>
        </div>

        <p-dialog [header]="'Histórico de Jogos - ' + selectedGroup()" [(visible)]="historyDialogVisible" [modal]="true" [style]="{ width: '90vw', maxWidth: '600px' }" [contentStyle]="{ padding: '0' }" [dismissableMask]="true">
          <div class="flex flex-col">
            @for (match of selectedGroupMatches(); track match.num) {
              <app-group-history-card [match]="match" class="border-b border-surface-800 last:border-b-0"></app-group-history-card>
            }
          </div>
        </p-dialog>
      }
    </div>
  `,
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

  limit = signal<number>(4);

  visibleGroups = computed(() => {
    return this.groupStandings().slice(0, this.limit());
  });

  hasMoreGroups = computed(() => {
    return this.groupStandings().length > this.limit();
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
