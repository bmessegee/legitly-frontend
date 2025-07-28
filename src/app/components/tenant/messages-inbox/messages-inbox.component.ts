import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';

import { MessageThread, Message, MessageType } from '../../../models/message.model';
import { Customer } from '../../../models/customer.model';
import { MessagesService } from '../../../services/messages.service';
import { AuthService } from '../../../services/auth.service';
import { CustomerService } from '../../../services/customer.service';
import { NewMessageComponent } from '../../common/messages/new-message/new-message.component';

@Component({
  selector: 'app-messages-inbox',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatExpansionModule,
    MatTabsModule,
    MatDialogModule
  ],
  templateUrl: './messages-inbox.component.html',
  styleUrls: ['./messages-inbox.component.scss']
})
export class MessagesInboxComponent implements OnInit {
  private messagesService = inject(MessagesService);
  public authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  messageThreads: MessageThread[] = [];
  filteredThreads: MessageThread[] = [];
  selectedThread?: MessageThread;
  loading = true;
  error: string | null = null;
  filterText = '';

  // New message functionality
  availableCustomers: Customer[] = [];

  ngOnInit(): void {
    this.loadTenantInbox();
    this.loadAvailableCustomers();
  }

  openNewMessageModal(): void {
    const dialogRef = this.dialog.open(NewMessageComponent, {
      width: '600px',
      data: {
        isReply: false,
        tenantId: this.authService.currentUser?.tenantId,
        availableCustomers: this.availableCustomers
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.loadTenantInbox();
      }
    });
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
    
    // Mark thread as read
    if (thread.UnreadCount > 0 && thread.ThreadId) {
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

  openReplyModal(message?: Message): void {
    const targetMessage = message || this.getLastMessage();
    if (!targetMessage) return;
    
    const dialogRef = this.dialog.open(NewMessageComponent, {
      width: '600px',
      data: {
        isReply: true,
        parentMessage: targetMessage,
        customerId: this.selectedThread?.CustomerId,
        tenantId: this.authService.currentUser?.tenantId,
        threadSubject: this.selectedThread?.Subject
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.loadTenantInbox();
        // Refresh selected thread
        if (this.selectedThread) {
          const refreshedThread = this.messageThreads.find(t => 
            t.ThreadId === this.selectedThread?.ThreadId
          );
          if (refreshedThread) {
            this.selectedThread = refreshedThread;
          }
        }
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

  // New message functionality methods
  loadAvailableCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.availableCustomers = customers;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  getCustomerDisplayName(customer: Customer): string {
    return customer.Name || customer.Name || `Customer ${customer.CustomerId}`;
  }

}