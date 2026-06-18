export interface Team {
  name: string;
  code: string;  // e.g., "BR", "AR", "DE" (ISO alpha-2 for flagcdn)
}

export interface Goal {
  name: string;
  minute: string;
}

export interface Match {
  num: number;
  date: string;        // ISO string YYYY-MM-DD
  time: string;        // original time string from API
  team1: Team;
  team2: Team;
  score?: {
    ft: [number, number];  // full time
  };
  goals1?: Goal[];
  goals2?: Goal[];
  group?: string;
  stage: string;       // "Group A", "Round of 32", "Semi-final", etc.
  stadium: {
    name: string;
    city: string;
  };

  // Custom properties added for app logic
  localDate: Date;
  status: 'Passando Agora' | 'Em Breve' | 'Hoje' | 'Amanhã' | 'Encerrado' | 'Futuro';
}

export interface GroupResult {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface TopScorer {
  name: string;
  team: Team;
  goals: number;
}
