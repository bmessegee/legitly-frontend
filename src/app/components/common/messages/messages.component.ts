import { Component, Input, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf, JsonPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Message, MessageThread } from '../../../models/message.model';
import { MessagesService } from '../../../services/messages.service';
import { AuthService } from '../../../services/auth.service';
import { NewMessageComponent } from './new-message/new-message.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { Customer } from '../../../models/customer.model';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  imports: [
    NgIf, NgFor, JsonPipe,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
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

  // The currently selected thread and message
  selectedThread?: MessageThread;
  selectedMessage?: Message;
  
  constructor(
    private messagesService: MessagesService, 
    private customerService: CustomerService,
    public authService: AuthService,
    private dialog: MatDialog
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
    if (!this.customer) {
      console.log('No customer found, cannot load threads');
      return;
    }
    
    console.log('Loading message threads for customer:', this.customer.CustomerId);
    
    this.messagesService.getCustomerThreads(this.customer.CustomerId).subscribe({
      next: threads => {
        console.log('Received threads:', threads);
        console.log('Number of threads:', threads?.length);
        this.messageThreads = threads || [];
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load message threads for customer ' + this.customer?.Name;
        console.error('Error loading threads:', err);
        this.loading = false;
      }
    });
  }

  // Called when a thread is selected from the list.
  onSelectThread(thread: MessageThread): void {
    this.selectedThread = thread;
    
    // If ThreadId is null, use the messages from the thread directly
    if (thread.ThreadId) {
      this.loadThreadMessages(thread.ThreadId);
      
      // Mark thread as read
      this.messagesService.markThreadAsRead(thread.ThreadId).subscribe({
        next: () => {
          thread.UnreadCount = 0;
          thread.Messages.forEach(msg => msg.IsRead = true);
        },
        error: error => console.error('Failed to mark thread as read', error)
      });
    } else {
      // Use messages directly from the thread since ThreadId is null
      this.selectedThreadMessages = thread.Messages || [];
      
      // Mark messages as read individually if needed
      thread.UnreadCount = 0;
      thread.Messages.forEach(msg => msg.IsRead = true);
    }
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

  // Open new message modal
  openNewMessageModal(): void {
    const dialogRef = this.dialog.open(NewMessageComponent, {
      width: '600px',
      data: {
        isReply: false,
        customerId: this.customer?.CustomerId,
        tenantId: this.getTenantId()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.onMessageSent(result.subject); // Pass the subject to help find the new thread
      }
    });
  }

  // Open reply modal
  openReplyModal(): void {
    if (!this.selectedThread || !this.selectedThreadMessages.length) return;
    
    const dialogRef = this.dialog.open(NewMessageComponent, {
      width: '600px',
      data: {
        isReply: true,
        parentMessage: this.selectedThreadMessages[this.selectedThreadMessages.length - 1],
        customerId: this.customer?.CustomerId,
        tenantId: this.getTenantId(),
        threadSubject: this.selectedThread.Subject
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onMessageSent();
      }
    });
  }

  // Reload threads after a new message is sent.
  onMessageSent(newMessageSubject?: string): void {
    const currentThreadSubject = this.selectedThread?.Subject;
    const currentCustomerId = this.selectedThread?.CustomerId;
    const wasNewMessage = !this.selectedThread; // Track if this was a new message vs reply
    
    // Reload message threads and then update selected thread
    this.messagesService.getCustomerThreads(this.customer?.CustomerId || '').subscribe({
      next: threads => {
        console.log('Threads reloaded after message sent:', threads);
        this.messageThreads = threads || [];
        
        if (wasNewMessage && newMessageSubject) {
          // For new messages, find thread by subject
          console.log('New message sent, looking for thread with subject:', newMessageSubject);
          const newThread = this.messageThreads.find(t => t.Subject === newMessageSubject);
          if (newThread) {
            this.selectedThread = newThread;
            this.selectedThreadMessages = newThread.Messages || [];
            console.log('Selected new thread:', this.selectedThread);
          } else {
            console.log('New thread not found, selecting first thread if available');
            if (this.messageThreads.length > 0) {
              this.selectedThread = this.messageThreads[0];
              this.selectedThreadMessages = this.selectedThread.Messages || [];
            }
          }
        } else if (currentThreadSubject && currentCustomerId) {
          // For replies, find and update the existing selected thread
          const refreshedThread = this.messageThreads.find(t => 
            t.Subject === currentThreadSubject && 
            t.CustomerId === currentCustomerId
          );
          
          if (refreshedThread) {
            console.log('Refreshed thread found:', refreshedThread);
            this.selectedThread = refreshedThread;
            this.selectedThreadMessages = refreshedThread.Messages || [];
          }
        }
        
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to reload message threads';
        console.error('Error reloading threads:', err);
        this.loading = false;
      }
    });
  }

  // Get tenant ID for messaging (for customer users)
  getTenantId(): string {
    // This would typically come from the customer's tenant association
    // For now, we'll need to get it from the current context or customer data
    return this.customer?.TenantId || '';
  }
}