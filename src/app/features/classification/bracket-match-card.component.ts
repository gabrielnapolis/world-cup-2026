import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Match} from '../../core/models/match.model';

@Component({
  selector: 'app-bracket-match-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-2 items-center w-full">
      <div class="text-xs text-surface-500 font-bold w-6 text-right pt-4">J{{ match().num }}</div>

      <div class="flex flex-col flex-1 min-w-0">
        <div class="text-xs text-surface-400 mb-1 pl-1">
           {{ match().localDate | date:'dd/MM/yyyy HH:mm' }}
        </div>

        <div class="flex flex-col bg-surface-0 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 text-sm overflow-hidden shadow-sm">

          <div class="flex justify-between items-center px-3 py-2 border-b border-surface-200 dark:border-surface-700"
               [class.bg-surface-100]="match().score?.ft?.[0]! > match().score?.ft?.[1]!"
               [class.dark:bg-surface-700]="match().score?.ft?.[0]! > match().score?.ft?.[1]!">
            <div class="flex items-center gap-2 overflow-hidden">
              @if (match().team1.name && !match().team1.name.match('^[1-3W][A-Z0-9/]+$') && match().team1.name !== 'un') {
                <img [src]="'https://flagcdn.com/w20/' + match().team1.code + '.png'" class="w-5 shadow-sm rounded-sm" onerror="this.src='https://flagcdn.com/w20/un.png'"/>
              } @else {
                <div class="w-5 h-3.5 bg-surface-200 dark:bg-surface-600 rounded-sm"></div>
              }
              <span class="truncate font-medium">{{ match().team1.name }}</span>
            </div>
            @if (match().score?.ft) {
              <span class="font-bold ml-2">{{ match().score!.ft[0] }}</span>
            }
          </div>

          <div class="flex justify-between items-center px-3 py-2"
               [class.bg-surface-100]="match().score?.ft?.[1]! > match().score?.ft?.[0]!"
               [class.dark:bg-surface-700]="match().score?.ft?.[1]! > match().score?.ft?.[0]!">
            <div class="flex items-center gap-2 overflow-hidden">
              @if (match().team2.name && !match().team2.name.match('^[1-3W][A-Z0-9/]+$') && match().team2.name !== 'un') {
                <img [src]="'https://flagcdn.com/w20/' + match().team2.code + '.png'" class="w-5 shadow-sm rounded-sm" onerror="this.src='https://flagcdn.com/w20/un.png'"/>
              } @else {
                <div class="w-5 h-3.5 bg-surface-200 dark:bg-surface-600 rounded-sm"></div>
              }
              <span class="truncate font-medium">{{ match().team2.name }}</span>
            </div>
            @if (match().score?.ft) {
              <span class="font-bold ml-2">{{ match().score!.ft[1] }}</span>
            }
          </div>

        </div>
      </div>
    </div>
  `
})
export class BracketMatchCardComponent {
  match = input.required<Match>();
}
