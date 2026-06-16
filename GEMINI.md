# World Cup 2026 Schedule App — Angular 20 + PrimeNG 20

## Contexto
Aplicação Angular 20 standalone para visualizar os jogos da Copa do Mundo FIFA 2026.
Uso pessoal, sem backend próprio. Os dados vêm da API pública:
https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json

## Stack
- Angular 20.3.25 (standalone components, signals, zoneless)
- PrimeNG 20 (instalado com --legacy-peer-deps)
- @primeuix/themes
- HttpClient com provideHttpClient()
- Nenhum NgModule — tudo via bootstrapApplication()

## Estrutura de pastas
src/
  app/
    core/
      services/
        world-cup.service.ts      # fetch + parsing dos dados da API
      models/
        match.model.ts            # interfaces: Match, Group, Team
    features/
      schedule/
        schedule.component.ts     # listagem de todos os jogos
        schedule.component.html
      group-stage/
        group-stage.component.ts  # fase de grupos com tabela de classificação
      match-card/
        match-card.component.ts   # card individual de jogo (reutilizável)
    app.component.ts
    app.routes.ts
    app.config.ts

## Requisitos funcionais
1. Tela principal: lista de jogos do dia atual em destaque
2. Filtro por fase (Grupos, Oitavas, Quartas, Semis, Final)
3. Filtro por grupo (A até L)
4. Card de jogo mostrando: bandeiras dos times, horário em Brasília (UTC-3), placar se disponível, estádio e cidade
5. Indicador visual se o jogo está "Hoje", "Amanhã" ou já encerrado
6. Seção de classificação da fase de grupos

## Requisitos técnicos
- WorldCupService: método getMatches() retorna Observable<Match[]>
  Converter datas da API (UTC) para horário de Brasília com Intl.DateTimeFormat
- Todos os componentes standalone: imports diretos de componentes PrimeNG
  ex: import { Card } from 'primeng/card'
- Usar signals (signal, computed, effect) para estado reativo — sem BehaviorSubject
- PrimeNG components a usar: Card, Tag, Chip, Skeleton (loading), Divider, Select (filtros), DataView para listagem
- Tema escuro por padrão usando providePrimeNG com preset Aura

## Match model (baseado na API openfootball)
interface Team {
  name: string;
  code: string;  // ex: "BRA", "ARG"
}

interface Match {
  num: number;
  date: string;        // ISO string
  time: string;        // "HH:MM" UTC
  team1: Team;
  team2: Team;
  score?: {
    ft: [number, number];  // full time
  };
  group?: string;
  stage: string;       // "Group A", "Round of 32", "Semi-final", etc.
  stadium: {
    name: string;
    city: string;
  };
}

## Bandeiras
Usar flagcdn.com para bandeiras:
https://flagcdn.com/w40/{code}.png
onde {code} é o ISO 3166-1 alpha-2 em lowercase (ex: br, ar, de)
Mapear o código FIFA (3 letras) para ISO 2 letras via objeto de lookup no service.
