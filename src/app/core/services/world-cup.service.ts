import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Match, TopScorer, GroupResult, Team, MatchStatus, MatchStatusType } from '../models/match.model';

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
  'Round of 32': 'Fase 16 Avos',
  'Round of 16': 'Oitavas de Final',
  'Quarter-final': 'Quartas de Final',
  'Semi-finals': 'Semifinais',
  Final: 'Final',
  'Match for third place': 'Decisão do 3º Lugar',
  'Play-off for third place': 'Decisão do 3º Lugar',
};

const STADIUM_IMAGES: Record<string, string> = {
  'Atlanta': 'atlanta.avif',
  'Boston (Foxborough)': 'boston.avif',
  'Dallas (Arlington)': 'dallas.avif',
  'Guadalajara (Zapopan)': 'guadalajara.avif',
  'Houston': 'houston.avif',
  'Kansas City': 'kansas.avif',
  'Los Angeles (Inglewood)': 'los-angeles.avif',
  'Mexico City': 'cidade-do-mexico.avif',
  'Miami (Miami Gardens)': 'miami.avif',
  'Monterrey (Guadalupe)': 'monterrey.avif',
  'New York/New Jersey (East Rutherford)': 'nova-york-e-nova-jersy.jpg',
  'Philadelphia': 'filadelfia.avif',
  'San Francisco Bay Area (Santa Clara)': 'san-francisco.avif',
  'Seattle': 'seattle.avif',
  'Toronto': 'toronto.avif',
  'Vancouver': 'bc-place.avif'
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

  groupStandings = computed<Map<string, GroupResult[]>>(() => {
    const standings = new Map<string, GroupResult[]>();

    const groups = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F', 'Grupo G', 'Grupo H', 'Grupo I', 'Grupo J', 'Grupo K', 'Grupo L'];
    groups.forEach(g => standings.set(g, []));

    const teamMap = new Map<string, GroupResult>();

    this.matches().forEach(m => {
      if (!m.group) return;

      [m.team1, m.team2].forEach(team => {
        if (!teamMap.has(team.name) && team.name && !team.name.match(/^[1-3][A-L]/)) {
           teamMap.set(team.name, {
             team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
           });
        }
      });

      if (m.score && m.score.ft) {
        const [g1, g2] = m.score.ft;
        const t1 = teamMap.get(m.team1.name);
        const t2 = teamMap.get(m.team2.name);
        if (t1 && t2) {
          t1.played++;
          t2.played++;
          t1.goalsFor += g1;
          t1.goalsAgainst += g2;
          t2.goalsFor += g2;
          t2.goalsAgainst += g1;
          t1.goalDifference = t1.goalsFor - t1.goalsAgainst;
          t2.goalDifference = t2.goalsFor - t2.goalsAgainst;

          if (g1 > g2) { t1.won++; t1.points += 3; t2.lost++; }
          else if (g1 < g2) { t2.won++; t2.points += 3; t1.lost++; }
          else { t1.drawn++; t2.drawn++; t1.points += 1; t2.points += 1; }
        }
      }
    });

    teamMap.forEach((res, teamName) => {
      const teamMatch = this.matches().find(m => m.group && (m.team1.name === teamName || m.team2.name === teamName));
      if (teamMatch && teamMatch.group) {
        const groupStandingsArr = standings.get(teamMatch.group);
        if (groupStandingsArr) {
          groupStandingsArr.push(res);
        }
      }
    });

    standings.forEach(arr => {
      arr.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
    });

    return standings;
  });

  projectedBracket = computed<Match[]>(() => {
    const matches = this.matches();
    const standings = this.groupStandings();

    const placements = new Map<string, Team>();
    const thirdPlaces: { groupLetter: string, result: GroupResult }[] = [];

    standings.forEach((results, groupName) => {
      const letter = groupName.replace('Grupo ', '');
      if (results.length > 0) placements.set(`1${letter}`, results[0].team);
      if (results.length > 1) placements.set(`2${letter}`, results[1].team);
      if (results.length > 2) thirdPlaces.push({ groupLetter: letter, result: results[2] });
    });

    thirdPlaces.sort((a, b) => b.result.points - a.result.points || b.result.goalDifference - a.result.goalDifference || b.result.goalsFor - a.result.goalsFor);
    const best8Thirds = thirdPlaces.slice(0, 8);

    let availableThirds = [...best8Thirds];
    const projected = matches.map(m => ({ ...m, team1: { ...m.team1 }, team2: { ...m.team2 } }));

    projected.forEach(m => {
       if (m.stage === 'Round of 32' || m.stage === 'Segunda Fase') {
          if (m.team1.name.match(/^[1-2][A-L]$/)) {
            const resolved = placements.get(m.team1.name);
            if (resolved) m.team1 = resolved;
          } else if (m.team1.name.startsWith('3')) {
            const possibleGroups = m.team1.name.replace('3', '').split('/');
            const foundIdx = availableThirds.findIndex(t => possibleGroups.some(pg => t.groupLetter === pg));
            if (foundIdx !== -1) {
              m.team1 = availableThirds[foundIdx].result.team;
              availableThirds.splice(foundIdx, 1);
            }
          }

          if (m.team2.name.match(/^[1-2][A-L]$/)) {
            const resolved = placements.get(m.team2.name);
            if (resolved) m.team2 = resolved;
          } else if (m.team2.name.startsWith('3')) {
            const possibleGroups = m.team2.name.replace('3', '').split('/');
            const foundIdx = availableThirds.findIndex(t => possibleGroups.some(pg => t.groupLetter === pg));
            if (foundIdx !== -1) {
              m.team2 = availableThirds[foundIdx].result.team;
              availableThirds.splice(foundIdx, 1);
            }
          }
       }
    });

    const matchMap = new Map<number, Match>();
    projected.forEach(m => matchMap.set(m.num, m));

    projected.forEach(m => {
       if (m.team1.name.startsWith('W')) {
          const matchNum = parseInt(m.team1.name.replace(/\D/g, ''));
          const prevMatch = matchMap.get(matchNum);
          if (prevMatch && prevMatch.score && prevMatch.score.ft) {
             m.team1 = prevMatch.score.ft[0] > prevMatch.score.ft[1] ? prevMatch.team1 : prevMatch.team2;
          }
       }
       if (m.team2.name.startsWith('W')) {
          const matchNum = parseInt(m.team2.name.replace(/\D/g, ''));
          const prevMatch = matchMap.get(matchNum);
          if (prevMatch && prevMatch.score && prevMatch.score.ft) {
             m.team2 = prevMatch.score.ft[0] > prevMatch.score.ft[1] ? prevMatch.team1 : prevMatch.team2;
          }
       }
    });

    return projected;
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
          image: STADIUM_IMAGES[m.ground] || '',
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
  ): MatchStatusType {
    if (score && score.ft && score.ft.length === 2) {
      return MatchStatus.FINISHED;
    }

    const now = new Date();
    const todayStr = now.toLocaleDateString('pt-BR');
    const tomorrowStr = new Date(now.getTime() + 86400000).toLocaleDateString('pt-BR');

    const matchDateStr = localDate.toLocaleDateString('pt-BR');

    const matchEndTime = new Date(localDate.getTime() + 120 * 60000);

    if (now >= localDate && now <= matchEndTime) {
      return MatchStatus.LIVE;
    }

    const timeUntilMatch = localDate.getTime() - now.getTime();
    if (timeUntilMatch > 0 && timeUntilMatch <= 90 * 60000) {
      return MatchStatus.SOON;
    }

    if (matchDateStr === todayStr) {
      // It could also be Encerrado if time passed, but we'll rely on score for that,
      // or if you want to consider time:
      if (now > matchEndTime) {
        return MatchStatus.FINISHED; // assuming a match takes ~2 hours
      }
      return MatchStatus.TODAY;
    } else if (matchDateStr === tomorrowStr) {
      return MatchStatus.TOMORROW;
    } else if (localDate.getTime() < now.getTime()) {
      return MatchStatus.FINISHED;
    }

    return MatchStatus.FUTURE;
  }
}
