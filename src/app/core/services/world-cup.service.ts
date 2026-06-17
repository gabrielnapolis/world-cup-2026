import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Match, TopScorer } from '../models/match.model';

const TRANSLATIONS: Record<string, string> = {
  Brazil: 'Brasil',
  Germany: 'Alemanha',
  Spain: 'Espanha',
  England: 'Inglaterra',
  Netherlands: 'Holanda',
  Italy: 'Itália',
  France: 'França',
  Croatia: 'Croácia',
  Belgium: 'Bélgica',
  Switzerland: 'Suíça',
  Denmark: 'Dinamarca',
  Sweden: 'Suécia',
  Poland: 'Polônia',
  Serbia: 'Sérvia',
  'Czech Republic': 'República Tcheca',
  'Bosnia & Herzegovina': 'Bósnia e Herzegovina',
  Uzbekistan: 'Uzbequistão',
  Scotland: 'Escócia',
  Wales: 'País de Gales',
  'Northern Ireland': 'Irlanda do Norte',
  'Republic of Ireland': 'Irlanda',
  Mexico: 'México',
  USA: 'Estados Unidos',
  Canada: 'Canadá',
  Panama: 'Panamá',
  'Costa Rica': 'Costa Rica',
  Jamaica: 'Jamaica',
  'El Salvador': 'El Salvador',
  Honduras: 'Honduras',
  Uruguay: 'Uruguai',
  Colombia: 'Colômbia',
  Chile: 'Chile',
  Ecuador: 'Equador',
  Peru: 'Peru',
  Venezuela: 'Venezuela',
  Paraguay: 'Paraguai',
  Bolivia: 'Bolívia',
  Argentina: 'Argentina',
  Japan: 'Japão',
  'South Korea': 'Coreia do Sul',
  'Saudi Arabia': 'Arábia Saudita',
  Iran: 'Irã',
  Jordan: 'Jordânia',
  'DR Congo': 'R. do Congo',
  Australia: 'Austrália',
  'Cape Verde': 'Cabo Verde',
  Qatar: 'Catar',
  Senegal: 'Senegal',
  Morocco: 'Marrocos',
  Cameroon: 'Camarões',
  Nigeria: 'Nigéria',
  Algeria: 'Argélia',
  Egypt: 'Egito',
  Tunisia: 'Tunísia',
  'Ivory Coast': 'Costa do Marfim',
  'South Africa': 'África do Sul',
  'New Zealand': 'Nova Zelândia',
  Norway: 'Noruega',
  Iraq: 'Iraque',
  Turkey: 'Turquia',
  Ghana: 'Gana',
  Austria: 'Áustria',
  'Round of 32': 'Segunda Fase',
  'Round of 16': 'Oitavas de Final',
  'Quarter-final': 'Quartas de Final',
  'Semi-finals': 'Semifinais',
  Final: 'Final',
  'Match for third place': 'Decisão do 3º Lugar',
  'Play-off for third place': 'Decisão do 3º Lugar',
};

@Injectable({
  providedIn: 'root',
})
export class WorldCupService {
  private http = inject(HttpClient);
  private readonly apiUrl =
    'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

  matches = signal<Match[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  topScorers = computed<TopScorer[]>(() => {
    const scorersMap = new Map<string, TopScorer>();

    this.matches().forEach((m) => {
      if (m.goals1) {
        m.goals1.forEach((g) => {
          const key = `${g.name}-${m.team1.name}`;
          if (!scorersMap.has(key)) {
            scorersMap.set(key, { name: g.name, team: m.team1, goals: 0 });
          }
          scorersMap.get(key)!.goals++;
        });
      }

      if (m.goals2) {
        m.goals2.forEach((g) => {
          const key = `${g.name}-${m.team2.name}`;
          if (!scorersMap.has(key)) {
            scorersMap.set(key, { name: g.name, team: m.team2, goals: 0 });
          }
          scorersMap.get(key)!.goals++;
        });
      }
    });

    return Array.from(scorersMap.values()).sort(
      (a, b) => b.goals - a.goals || a.name.localeCompare(b.name)
    );
  });

  private countryToIsoMap: Record<string, string> = {
    Argentina: 'ar',
    Brazil: 'br',
    France: 'fr',
    Germany: 'de',
    Italy: 'it',
    Spain: 'es',
    England: 'gb-eng',
    Netherlands: 'nl',
    Portugal: 'pt',
    Belgium: 'be',
    Mexico: 'mx',
    USA: 'us',
    Canada: 'ca',
    Uruguay: 'uy',
    Colombia: 'co',
    Japan: 'jp',
    'South Korea': 'kr',
    Senegal: 'sn',
    Morocco: 'ma',
    Croatia: 'hr',
    Switzerland: 'ch',
    Serbia: 'rs',
    Denmark: 'dk',
    Sweden: 'se',
    Poland: 'pl',
    'South Africa': 'za',
    'Czech Republic': 'cz',
    'Bosnia & Herzegovina': 'ba',
    Qatar: 'qa',
    Chile: 'cl',
    Ecuador: 'ec',
    Peru: 'pe',
    Venezuela: 've',
    Paraguay: 'py',
    Bolivia: 'bo',
    Cameroon: 'cm',
    Nigeria: 'ng',
    Algeria: 'dz',
    Egypt: 'eg',
    Tunisia: 'tn',
    Mali: 'ml',
    Ghana: 'gh',
    'Ivory Coast': 'ci',
    Australia: 'au',
    Iran: 'ir',
    'Saudi Arabia': 'sa',
    'Costa Rica': 'cr',
    Panama: 'pa',
    Honduras: 'hn',
    Jamaica: 'jm',
    'El Salvador': 'sv',
    'New Zealand': 'nz',
    Wales: 'gb-wls',
    Scotland: 'gb-sct',
    'Northern Ireland': 'gb-nir',
    'Republic of Ireland': 'ie',
    'DR Congo': 'cd',
    'Cape Verde': 'cv',
    Haiti: 'ht',
    Norway: 'no',
    Iraq: 'iq',
    Turkey: 'tr',
    Uzbekistan: 'uz',
    Jordan: 'jo',
    'Curaçao': 'cw',
    Austria: 'at',
  };

  constructor() {}

  loadMatches() {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<any>(this.apiUrl).subscribe({
      next: (data) => {
        const parsedMatches = this.parseMatches(data);
        parsedMatches.sort((a, b) => a.localDate.getTime() - b.localDate.getTime());
        this.matches.set(parsedMatches);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching matches', err);
        this.error.set('Failed to load matches.');
        this.loading.set(false);
      },
    });
  }

  private parseMatches(data: any): Match[] {
    const apiMatches = data.matches || [];
    return apiMatches.map((m: any, index: number) => {
      const localDate = this.parseLocalDate(m.date, m.time);

      const team1Name = m.team1;
      const team2Name = m.team2;

      // Traduz "Group A" para "Grupo A"
      const groupName = m.group ? m.group.replace('Group', 'Grupo') : undefined;
      const stageName = groupName ? groupName : TRANSLATIONS[m.round] || m.round;

      const match: Match = {
        num: index + 1,
        date: m.date,
        time: m.time,
        team1: {
          name: TRANSLATIONS[team1Name] || team1Name,
          code: this.countryToIsoMap[team1Name] || 'un', // 'un' for unknown or fallback
        },
        team2: {
          name: TRANSLATIONS[team2Name] || team2Name,
          code: this.countryToIsoMap[team2Name] || 'un',
        },
        group: groupName,
        stage: stageName,
        stadium: {
          name: m.ground,
          city: m.ground, // Depending on API
        },
        score: m.score,
        goals1: m.goals1,
        goals2: m.goals2,
        localDate: localDate,
        status: this.calculateStatus(localDate, m.score),
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

  private calculateStatus(
    localDate: Date,
    score?: { ft: [number, number] },
  ): 'Hoje' | 'Amanhã' | 'Encerrado' | 'Futuro' {
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
      if (localDate.getTime() + 120 * 60000 < now.getTime()) {
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
