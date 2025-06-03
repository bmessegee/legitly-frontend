import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { ApiService } from './api.service'; // Adjust the import path as needed
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  // Define the endpoint for messages relative to the API service's base URL.
  private endpoint = 'message';

  constructor(private apiService: ApiService) { }

  /**
   * Retrieve all messages.
   *
   * This delegates the GET request to the ApiService.
   */
  getMessages(): Observable<Message[]> {
    return this.apiService.get<Message[]>(this.endpoint);
  }

  getMessagesForCustomer(customer: Customer): Observable<Message[]> {
    return this.apiService.get<Message[]>(this.endpoint + "?customerId=" + customer.CustomerId);
  }
  /**
   * Send a new message.
   *
   * This delegates the POST request to the ApiService.
   *
   * @param message Partial message data to be sent.
   */
  sendMessage(message: Partial<Message>): Observable<Message> {
    return this.apiService.post<Message>(this.endpoint, message);
  }

  /**
   * Mark a message as read.
   *
   * This delegates the PUT request to the ApiService by appending `/read`
   * to the message endpoint.
   *
   * @param messageId The unique identifier of the message to mark as read.
   */
  markAsRead(messageId: string): Observable<any> {
    const endpoint = `${this.endpoint}/${messageId}/read`;
    return this.apiService.put(endpoint, {});
  }
}