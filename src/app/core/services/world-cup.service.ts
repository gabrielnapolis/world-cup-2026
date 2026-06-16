import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Match, Team } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class WorldCupService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

  // State
  matches = signal<Match[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Partial mapping for some known teams to ISO alpha-2
  private countryToIsoMap: Record<string, string> = {
    'Argentina': 'ar', 'Brazil': 'br', 'France': 'fr', 'Germany': 'de', 'Italy': 'it',
    'Spain': 'es', 'England': 'gb-eng', 'Netherlands': 'nl', 'Portugal': 'pt', 'Belgium': 'be',
    'Mexico': 'mx', 'USA': 'us', 'Canada': 'ca', 'Uruguay': 'uy', 'Colombia': 'co',
    'Japan': 'jp', 'South Korea': 'kr', 'Senegal': 'sn', 'Morocco': 'ma', 'Croatia': 'hr',
    'Switzerland': 'ch', 'Serbia': 'rs', 'Denmark': 'dk', 'Sweden': 'se', 'Poland': 'pl',
    'South Africa': 'za', 'Czech Republic': 'cz', 'Bosnia & Herzegovina': 'ba', 'Qatar': 'qa',
    'Chile': 'cl', 'Ecuador': 'ec', 'Peru': 'pe', 'Venezuela': 've', 'Paraguay': 'py',
    'Bolivia': 'bo', 'Cameroon': 'cm', 'Nigeria': 'ng', 'Algeria': 'dz', 'Egypt': 'eg',
    'Tunisia': 'tn', 'Mali': 'ml', 'Ghana': 'gh', 'Ivory Coast': 'ci', 'Australia': 'au',
    'Iran': 'ir', 'Saudi Arabia': 'sa', 'Costa Rica': 'cr', 'Panama': 'pa', 'Honduras': 'hn',
    'Jamaica': 'jm', 'El Salvador': 'sv', 'New Zealand': 'nz', 'Wales': 'gb-wls',
    'Scotland': 'gb-sct', 'Northern Ireland': 'gb-nir', 'Republic of Ireland': 'ie'
  };

  constructor() {}

  loadMatches() {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<any>(this.apiUrl).subscribe({
      next: (data) => {
        const parsedMatches = this.parseMatches(data);
        // Sort by localDate by default
        parsedMatches.sort((a, b) => a.localDate.getTime() - b.localDate.getTime());
        this.matches.set(parsedMatches);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching matches', err);
        this.error.set('Failed to load matches.');
        this.loading.set(false);
      }
    });
  }

  private parseMatches(data: any): Match[] {
    const apiMatches = data.matches || [];
    return apiMatches.map((m: any, index: number) => {

      const localDate = this.parseLocalDate(m.date, m.time);

      const team1Name = m.team1;
      const team2Name = m.team2;

      const match: Match = {
        num: index + 1,
        date: m.date,
        time: m.time,
        team1: {
          name: team1Name,
          code: this.countryToIsoMap[team1Name] || 'un' // 'un' for unknown or fallback
        },
        team2: {
          name: team2Name,
          code: this.countryToIsoMap[team2Name] || 'un'
        },
        group: m.group,
        stage: m.group ? m.group : m.round,
        stadium: {
          name: m.ground,
          city: m.ground // Depending on API
        },
        score: m.score,
        goals1: m.goals1,
        goals2: m.goals2,
        localDate: localDate,
        status: this.calculateStatus(localDate, m.score)
      };

      return match;
    });
  }

  private parseLocalDate(dateStr: string, timeStr: string): Date {
    // timeStr looks like "13:00 UTC-6"
    if (!timeStr) {
        return new Date(dateStr + 'T00:00:00Z');
    }
    const [time, tz] = timeStr.split(' ');
    let isoOffset = 'Z';

    if (tz && tz.startsWith('UTC')) {
      const offset = tz.replace('UTC', '');
      if (offset) {
        const sign = offset.startsWith('-') || offset.startsWith('+') ? offset[0] : '+';
        const num = parseInt(offset.replace(/[+-]/, ''), 10);
        const hours = isNaN(num) ? '00' : Math.abs(num).toString().padStart(2, '0');
        isoOffset = `${sign}${hours}:00`;
      }
    }

    // dateStr is like "2026-06-11"
    const isoString = `${dateStr}T${time}:00${isoOffset}`;
    return new Date(isoString);
  }

  private calculateStatus(localDate: Date, score?: { ft: [number, number] }): 'Hoje' | 'Amanhã' | 'Encerrado' | 'Futuro' {
    if (score && score.ft && score.ft.length === 2) {
      return 'Encerrado';
    }

    const now = new Date();
    // Normalize to start of day in local time for comparison
    const todayStr = now.toLocaleDateString('pt-BR');
    const tomorrowStr = new Date(now.getTime() + 86400000).toLocaleDateString('pt-BR');

    const matchDateStr = localDate.toLocaleDateString('pt-BR');

    if (matchDateStr === todayStr) {
      // It could also be Encerrado if time passed, but we'll rely on score for that,
      // or if you want to consider time:
      if (localDate.getTime() + (120 * 60000) < now.getTime()) {
        return 'Encerrado'; // assuming a match takes ~2 hours
      }
      return 'Hoje';
    } else if (matchDateStr === tomorrowStr) {
      return 'Amanhã';
    } else if (localDate.getTime() < now.getTime()) {
      return 'Encerrado';
    }

    return 'Futuro';
  }
}
