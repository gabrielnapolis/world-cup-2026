import { Component, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, IconField, InputIcon],
  template: `
    <p-iconfield [class]="styleClass()">
      <p-inputicon
        [class]="value() ? 'pi pi-times cursor-pointer' : 'pi pi-search'"
        (click)="clear()"
      />
      <input
        pInputText
        type="text"
        [ngModel]="value()"
        (ngModelChange)="value.set($event)"
        [placeholder]="placeholder()"
        class="w-full"
      />
    </p-iconfield>
  `
})
export class SearchInputComponent {
  value = model<string>('');
  placeholder = input<string>('Buscar...');
  styleClass = input<string>('w-full');

  clear() {
    if (this.value()) {
      this.value.set('');
    }
  }
}
