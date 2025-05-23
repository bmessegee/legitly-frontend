import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Message } from '../../models/message.model';
import { MessagesService } from '../../services/messages.service';
import { MessageDetailComponent } from './message-detail/message-detail.component';
import { MessageListComponent } from './message-list/message-list.component';
import { NewMessageComponent } from './new-message/new-message.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
  imports: [
    NgIf, 
    MatGridListModule,
    MatCardModule,
    MessageDetailComponent, 
    MessageListComponent, 
    NewMessageComponent]
})
export class MessagesComponent implements OnInit {
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
    if (!message.isRead) {
      this.messagesService.markAsRead(message.id).subscribe({
        next: () => { message.isRead = true; },
        error: error => console.error('Failed to mark message as read', error)
      });
    }
  }

  // Reload messages after a new message is sent.
  onMessageSent(): void {
    this.loadMessages();
  }
}