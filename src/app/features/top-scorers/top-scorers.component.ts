import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldCupService } from '../../core/services/world-cup.service';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-top-scorers',
  standalone: true,
  imports: [CommonModule, Card, Tag],
  templateUrl: './top-scorers.component.html'
})
export class TopScorersComponent {
  worldCupService = inject(WorldCupService);
  topScorers = this.worldCupService.topScorers;
}
