import { Component } from '@angular/core';
import { FieldArrayType, FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-repeat-field',
  standalone: true,
  imports: [CommonModule, FormlyModule, MatButtonModule, MatIconModule],
  template: `
    <div class="repeat-field">
      <div *ngFor="let field of field.fieldGroup; let i = index" class="repeat-item">
        <formly-field [field]="field"></formly-field>
        <button
          *ngIf="i > 0"
          mat-icon-button
          color="warn"
          type="button"
          (click)="remove(i)"
          class="remove-button">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
      <button
        mat-raised-button
        color="primary"
        type="button"
        (click)="add()"
        class="add-button">
        <mat-icon>add</mat-icon>
        {{ props['addText'] || 'Add' }}
      </button>
    </div>
  `,
  styles: [`
    .repeat-field {
      width: 100%;
    }
    .repeat-item {
      position: relative;
      margin-bottom: 16px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    .remove-button {
      position: absolute;
      top: 8px;
      right: 8px;
    }
    .add-button {
      margin-top: 8px;
    }
  `]
})
export class RepeatFieldComponent extends FieldArrayType {
}
