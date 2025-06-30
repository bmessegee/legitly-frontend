import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Message } from '../../../../models/message.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.scss'],
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule, MatIconModule, MatButtonModule]
})
export class MessageDetailComponent {
  @Input() message?: Message;
}