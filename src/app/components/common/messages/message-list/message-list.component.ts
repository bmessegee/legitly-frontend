import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Message } from '../../../../models/message.model';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss'],
  imports: [
    CommonModule,
    DatePipe,
    MatListModule,
    MatIconModule
  ]
})
export class MessageListComponent {
  @Input() messages: Message[] = [];
  @Output() selectMessage = new EventEmitter<Message>();

  // Emit the selected message when a list item is clicked.
  onMessageClick(message: Message): void {
    this.selectMessage.emit(message);
  }
}