import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'formly-wrapper-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="formly-panel">
      <mat-card-header *ngIf="to.label || to.description">
        <mat-card-title *ngIf="to.label">{{ to.label }}</mat-card-title>
        <mat-card-subtitle *ngIf="to.description">{{ to.description }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <ng-container #fieldComponent></ng-container>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .formly-panel {
      margin: 16px 0;
    }
    mat-card-header {
      background-color: #f5f5f5;
    }
  `]
})
export class FormlyWrapperPanelComponent extends FieldWrapper {}