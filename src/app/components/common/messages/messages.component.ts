import { Component, Input, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Message } from '../../../models/message.model';
import { MessagesService } from '../../../services/messages.service';
import { MessageDetailComponent } from './message-detail/message-detail.component';
import { MessageListComponent } from './message-list/message-list.component';
import { NewMessageComponent } from './new-message/new-message.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Customer } from '../../../models/customer.model';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
  imports: [
    NgIf, NgFor, 
    MatGridListModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MessageDetailComponent, 
    MessageListComponent, 
    NewMessageComponent,
    DatePipe]
})
export class MessagesComponent implements OnInit {

  @Input() customer: Customer | null = null;
  // List of messages.
  messages: Message[] = [];
  // The currently selected message (to view details).
  selectedMessage?: Message;
  
  constructor(private messagesService: MessagesService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  // Loads messages from the service.
  loadMessages(): void {
    this.messagesService.getMessages().subscribe({
      next: (data: Message[]) => { this.messages = data; },
      error: error => { console.error('Error loading messages', error); }
    });
  }

  // Called when a message is selected from the list.
  onSelect(message: Message): void {
    this.selectedMessage = message;
    if (!message.IsRead) {
      this.messagesService.markAsRead(message.MessageId).subscribe({
        next: () => { message.IsRead = true; },
        error: error => console.error('Failed to mark message as read', error)
      });
    }
  }

  // Reload messages after a new message is sent.
  onMessageSent(): void {
    this.loadMessages();
  }
}