import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';

import { MessageThread, Message, MessageType } from '../../../models/message.model';
import { MessagesService } from '../../../services/messages.service';
import { AuthService } from '../../../services/auth.service';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-messages-inbox',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatTabsModule
  ],
  templateUrl: './messages-inbox.component.html',
  styleUrls: ['./messages-inbox.component.scss']
})
export class MessagesInboxComponent implements OnInit {
  private messagesService = inject(MessagesService);
  public authService = inject(AuthService);
  private customerService = inject(CustomerService);

  messageThreads: MessageThread[] = [];
  filteredThreads: MessageThread[] = [];
  selectedThread?: MessageThread;
  loading = true;
  error: string | null = null;
  filterText = '';
  replyText = '';
  showReplyForm = false;
  selectedMessageForReply?: Message;

  ngOnInit(): void {
    this.loadTenantInbox();
  }

  loadTenantInbox(): void {
    this.loading = true;
    this.error = null;

    this.messagesService.getTenantInbox().subscribe({
      next: (threads) => {
        this.messageThreads = threads;
        this.filteredThreads = threads;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load messages';
        console.error('Error loading tenant inbox:', err);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    if (!this.filterText.trim()) {
      this.filteredThreads = this.messageThreads;
    } else {
      const filterLower = this.filterText.toLowerCase();
      this.filteredThreads = this.messageThreads.filter(thread =>
        thread.Subject?.toLowerCase().includes(filterLower) ||
        thread.CustomerName?.toLowerCase().includes(filterLower) ||
        thread.Messages.some(m => m.Content?.toLowerCase().includes(filterLower))
      );
    }
  }

  clearFilter(): void {
    this.filterText = '';
    this.filteredThreads = this.messageThreads;
  }

  selectThread(thread: MessageThread): void {
    this.selectedThread = thread;
    this.showReplyForm = false;
    this.selectedMessageForReply = undefined;
    
    // Mark thread as read
    if (thread.UnreadCount > 0) {
      this.messagesService.markThreadAsRead(thread.ThreadId).subscribe({
        next: () => {
          thread.UnreadCount = 0;
          // Update messages in thread to mark as read
          thread.Messages.forEach(m => {
            if (m.RecipientId === this.authService.currentUser?.userId && !m.IsRead) {
              m.IsRead = true;
            }
          });
        },
        error: (err) => console.error('Error marking thread as read:', err)
      });
    }
  }

  showReply(message?: Message): void {
    this.selectedMessageForReply = message || this.getLastMessage();
    this.showReplyForm = true;
    this.replyText = '';
  }

  cancelReply(): void {
    this.showReplyForm = false;
    this.selectedMessageForReply = undefined;
    this.replyText = '';
  }

  sendReply(): void {
    if (!this.selectedMessageForReply || !this.replyText.trim()) {
      return;
    }

    this.messagesService.replyToMessage(this.selectedMessageForReply.MessageId, this.replyText).subscribe({
      next: (reply) => {
        // Add reply to current thread
        if (this.selectedThread) {
          this.selectedThread.Messages.push(reply);
          this.selectedThread.LastMessageDate = reply.SentOn;
          this.selectedThread.LastSender = reply.SenderId;
        }
        
        this.cancelReply();
        
        // Refresh inbox to get updated thread order
        this.loadTenantInbox();
      },
      error: (err) => {
        console.error('Error sending reply:', err);
        this.error = 'Failed to send reply';
      }
    });
  }

  getCustomerName(customerId: string): string {
    // You might want to load customer names or use a customer lookup service
    return `Customer ${customerId.substring(0, 8)}...`;
  }

  getLastMessage(): Message | undefined {
    if (!this.selectedThread?.Messages?.length) {
      return undefined;
    }
    return this.selectedThread.Messages[this.selectedThread.Messages.length - 1];
  }

  getMessageSenderName(message: Message): string {
    if (message.SenderId === this.authService.currentUser?.userId) {
      return 'You';
    }
    return this.getCustomerName(message.CustomerId);
  }

  getUnreadCount(): number {
    return this.messageThreads.reduce((total, thread) => total + thread.UnreadCount, 0);
  }

  formatMessageDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  getThreadPreview(thread: MessageThread): string {
    const lastMessage = thread.Messages[thread.Messages.length - 1];
    const preview = lastMessage?.Content || '';
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  }
}