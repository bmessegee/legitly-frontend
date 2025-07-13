import { Component, Input, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Message, MessageThread } from '../../../models/message.model';
import { MessagesService } from '../../../services/messages.service';
import { AuthService } from '../../../services/auth.service';
import { MessageDetailComponent } from './message-detail/message-detail.component';
import { MessageListComponent } from './message-list/message-list.component';
import { NewMessageComponent } from './new-message/new-message.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Customer } from '../../../models/customer.model';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  imports: [
    NgIf, NgFor, 
    MatGridListModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MessageDetailComponent, 
    MessageListComponent, 
    NewMessageComponent,
    DatePipe]
})
export class MessagesComponent implements OnInit {

  @Input() customer: Customer | null = null;
  // List of message threads for customer.
  messageThreads: MessageThread[] = [];
  // Messages in the currently selected thread
  selectedThreadMessages: Message[] = [];
  loading = true;
  error: string | null = null;
  showNewMessage = false;

  // The currently selected thread and message
  selectedThread?: MessageThread;
  selectedMessage?: Message;
  
  constructor(
    private messagesService: MessagesService, 
    private customerService: CustomerService,
    public authService: AuthService
  ) {}




  ngOnInit(): void {
    if(!this.customer){
      this.customer = this.customerService.getCurrentUserAsCustomer();
    }
    if(!this.customer){
      this.loading = false;
      this.error = 'Failed to load customer';
      return;
    }
    this.loadMessageThreads();
  }

  loadMessageThreads(): void {
    if (!this.customer) return;
    
    this.messagesService.getCustomerThreads(this.customer.CustomerId).subscribe({
      next: threads => {
        this.messageThreads = threads;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load message threads for customer ' + this.customer?.Name;
        console.error(err);
        this.loading = false;
      }
    });
  }

  // Called when a thread is selected from the list.
  onSelectThread(thread: MessageThread): void {
    this.selectedThread = thread;
    this.loadThreadMessages(thread.ThreadId);
    
    // Mark thread as read
    this.messagesService.markThreadAsRead(thread.ThreadId).subscribe({
      next: () => {
        thread.UnreadCount = 0;
        thread.Messages.forEach(msg => msg.IsRead = true);
      },
      error: error => console.error('Failed to mark thread as read', error)
    });
  }

  loadThreadMessages(threadId: string): void {
    this.messagesService.getMessageThread(threadId).subscribe({
      next: (messages: Message[]) => {
        this.selectedThreadMessages = messages;
      },
      error: error => console.error('Error loading thread messages', error)
    });
  }

  // Called when a message is selected from the thread.
  onSelect(message: Message): void {
    this.selectedMessage = message;
  }

  // Show/hide new message form
  toggleNewMessage(): void {
    this.showNewMessage = !this.showNewMessage;
  }

  // Reload threads after a new message is sent.
  onMessageSent(): void {
    this.showNewMessage = false;
    this.loadMessageThreads();
    if (this.selectedThread) {
      this.loadThreadMessages(this.selectedThread.ThreadId);
    }
  }

  // Get tenant ID for messaging (for customer users)
  getTenantId(): string {
    // This would typically come from the customer's tenant association
    // For now, we'll need to get it from the current context or customer data
    return this.customer?.TenantId || '';
  }
}