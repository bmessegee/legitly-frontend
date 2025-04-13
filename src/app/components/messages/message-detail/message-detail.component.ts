import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Message } from '../../../models/message.model';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.scss'],
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule]
})
export class MessageDetailComponent {
  @Input() message?: Message;
}