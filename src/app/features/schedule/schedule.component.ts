import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {WorldCupService} from '../../core/services/world-cup.service';
import {MatchCardComponent} from '../match-card/match-card.component';
import {Select} from 'primeng/select';
import {Skeleton} from 'primeng/skeleton';
import {Button} from 'primeng/button';
import {DatePicker} from 'primeng/datepicker';
import {Popover} from 'primeng/popover';
import {RouterLink} from '@angular/router';
import { MatchStatus } from '../../core/models/match.model';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, MatchCardComponent, Select, Skeleton, Button, DatePicker, Popover, RouterLink],
  templateUrl: './schedule.component.html'
})
export class ScheduleComponent implements OnInit {
  private worldCupService = inject(WorldCupService);
  private all = 'Todos';

  matches = this.worldCupService.matches;
  loading = this.worldCupService.loading;

  selectedDateStr = signal<string>('');
  selectedStage = signal(this.all);
  selectedGroup = signal(this.all);

  availableDates = computed(() => {
    const allMatches = this.matches();
    const datesSet = new Set<string>();

    for (const match of allMatches) {
      const dateStr = this.formatDateStr(match.localDate);
      datesSet.add(dateStr);
    }

    return Array.from(datesSet).sort();
  });

  selectedDateIndex = computed(() => {
    const dates = this.availableDates();
    if (dates.length === 0) return -1;

    const idx = dates.indexOf(this.selectedDateStr());
    if (idx !== -1) return idx;

    const todayStr = this.formatDateStr(new Date());
    const todayIdx = dates.indexOf(todayStr);
    if (todayIdx !== -1) return todayIdx;

    const futureIdx = dates.findIndex(d => d >= todayStr);
    return futureIdx !== -1 ? futureIdx : dates.length - 1;
  });

  selectedDateLabel = computed(() => {
    const idx = this.selectedDateIndex();
    const dates = this.availableDates();
    if (idx === -1 || !dates[idx]) return '';
    const matchDateStr = dates[idx];
    const now = new Date();
    const todayStr = this.formatDateStr(now);
    const tomorrowStr = this.formatDateStr(new Date(now.getTime() + 86400000));

    if (matchDateStr === todayStr) return MatchStatus.TODAY;
    if (matchDateStr === tomorrowStr) return MatchStatus.TOMORROW;

    const [year, month, day] = matchDateStr.split('-');
    return `${day}/${month}/${year}`;
  });

  minDate = computed(() => {
    const dates = this.availableDates();
    if (!dates.length) return undefined;
    const [y, m, d] = dates[0].split('-');
    return new Date(+y, +m - 1, +d);
  });

  maxDate = computed(() => {
    const dates = this.availableDates();
    if (!dates.length) return undefined;
    const [y, m, d] = dates[dates.length - 1].split('-');
    return new Date(+y, +m - 1, +d);
  });

  disabledDates = computed(() => {
    const datesStr = this.availableDates();
    if (!datesStr.length) return [];

    const min = this.minDate()!;
    const max = this.maxDate()!;
    const disabled: Date[] = [];

    let current = new Date(min);
    while (current <= max) {
      const str = this.formatDateStr(current);
      if (!datesStr.includes(str)) {
        disabled.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return disabled;
  });

  selectedDateObj = computed(() => {
    const idx = this.selectedDateIndex();
    const dates = this.availableDates();
    if (idx === -1 || !dates[idx]) return undefined;

    const [y, m, d] = dates[idx].split('-');
    return new Date(+y, +m - 1, +d);
  });

  onDateSelect(date: Date, popover?: Popover) {
    if (date) {
      this.selectedDateStr.set(this.formatDateStr(date));
      popover?.hide();
    }
  }

  private formatDateStr(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  prevDay() {
    const idx = this.selectedDateIndex();
    if (idx > 0) {
      this.selectedDateStr.set(this.availableDates()[idx - 1]);
    }
  }

  nextDay() {
    const idx = this.selectedDateIndex();
    const dates = this.availableDates();
    if (idx !== -1 && idx < dates.length - 1) {
      this.selectedDateStr.set(dates[idx + 1]);
    }
  }

  groups = computed(() => {
    const allMatches = this.matches();
    const groupSet = new Set(allMatches.map(m => m.group).filter(Boolean));
    return [this.all, ...Array.from(groupSet).sort()];
  });

  filteredMatches = computed(() => {
    let filtered = [...this.matches()];
    const dates = this.availableDates();
    const idx = this.selectedDateIndex();

    if (idx !== -1) {
      const selectedDate = dates[idx];
      filtered = filtered.filter(m => this.formatDateStr(m.localDate) === selectedDate);
    }
    if (this.selectedStage() !== this.all) {
      filtered = filtered.filter(m => m.stage === this.selectedStage());
    }
    if (this.selectedGroup() !== this.all) {
      filtered = filtered.filter(m => m.group === this.selectedGroup());
    }
    filtered.sort((a, b) => {
      if (a.status === MatchStatus.LIVE && b.status !== MatchStatus.LIVE) return -1;
      if (b.status === MatchStatus.LIVE && a.status !== MatchStatus.LIVE) return 1;

      if (a.status === MatchStatus.SOON && b.status !== MatchStatus.SOON) return -1;
      if (b.status === MatchStatus.SOON && a.status !== MatchStatus.SOON) return 1;

      const dateA = new Date(a.localDate).getTime();
      const dateB = new Date(b.localDate).getTime();
      return dateA - dateB;
    });
    return filtered;
  });

  ngOnInit(): void {
    this.worldCupService.loadMatches();

    setInterval(() => {
      this.worldCupService.loadMatches();
    }, 10 * 60 * 1000);
  }
}
