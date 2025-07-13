import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message, MessageThread, MessageType } from '../models/message.model';
import { ApiService } from './api.service';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private endpoint = 'message';

  constructor(private apiService: ApiService) { }

  /**
   * Get all message threads for tenant inbox
   */
  getTenantInbox(): Observable<MessageThread[]> {
    return this.apiService.get<MessageThread[]>(`messages/tenant/inbox`);
  }

  /**
   * Get message threads for a specific customer
   */
  getCustomerThreads(customerId: string): Observable<MessageThread[]> {
    return this.apiService.get<MessageThread[]>(`messages/customer/${customerId}/threads`);
  }

  /**
   * Get all messages in a specific thread
   */
  getMessageThread(threadId: string): Observable<Message[]> {
    return this.apiService.get<Message[]>(`messages/thread/${threadId}`);
  }

  /**
   * Create a new message thread (first message in conversation)
   */
  createMessageThread(message: Message): Observable<Message> {
    return this.apiService.post<Message>(`messages/thread`, message);
  }

  /**
   * Reply to an existing message
   */
  replyToMessage(parentMessageId: string, content: string): Observable<Message> {
    return this.apiService.post<Message>(`messages/reply/${parentMessageId}`, { content });
  }

  /**
   * Mark a specific message as read
   */
  markAsRead(messageId: string): Observable<any> {
    return this.apiService.post(`messages/mark-read/${messageId}`, {});
  }

  /**
   * Mark entire thread as read
   */
  markThreadAsRead(threadId: string): Observable<any> {
    return this.apiService.post(`messages/thread/${threadId}/mark-read`, {});
  }

  // Legacy methods for backward compatibility
  getMessages(): Observable<Message[]> {
    return this.apiService.get<Message[]>(this.endpoint);
  }

  getMessagesForCustomer(customer: Customer): Observable<Message[]> {
    return this.apiService.get<Message[]>(`${this.endpoint}?customerId=${customer.CustomerId}`);
  }

  sendMessage(message: Partial<Message>): Observable<Message> {
    return this.apiService.post<Message>(this.endpoint, message);
  }
}