import {Component, computed, inject, ViewChild, ElementRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WorldCupService} from '../../core/services/world-cup.service';
import {BracketMatchCardComponent} from './bracket-match-card.component';
import {Button} from 'primeng/button';
import {Message} from 'primeng/message';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-classification',
  standalone: true,
  imports: [CommonModule, BracketMatchCardComponent, Button, Message, RouterLink],
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.css']
})
export class ClassificationComponent {
  private worldCupService = inject(WorldCupService);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  leftR32 = computed(() => this.getMatchesByNums([74, 77, 73, 75, 83, 84, 81, 82]));
  leftR16 = computed(() => this.getMatchesByNums([89, 90, 93, 94]));
  leftQF = computed(() => this.getMatchesByNums([97, 98]));
  leftSF = computed(() => this.getMatchesByNums([101]));

  rightR32 = computed(() => this.getMatchesByNums([76, 78, 79, 80, 86, 88, 85, 87]));
  rightR16 = computed(() => this.getMatchesByNums([91, 92, 95, 96]));
  rightQF = computed(() => this.getMatchesByNums([99, 100]));
  rightSF = computed(() => this.getMatchesByNums([102]));

  finalMatch = computed(() => this.getMatchesByNums([104]));
  thirdPlaceMatch = computed(() => this.getMatchesByNums([103]));

  private getMatchesByNums(nums: number[]) {
    const bracket = this.worldCupService.projectedBracket();
    return nums.map(n => bracket.find(m => m.num === n)).filter(m => !!m) as any[];
  }

  scrollBracket(direction: 'left' | 'right') {
    if (!this.scrollContainer) return;

    const scrollAmount = direction === 'left' ? -252 : 252;
    this.scrollContainer.nativeElement.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }
}
