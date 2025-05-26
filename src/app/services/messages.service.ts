import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { ApiService } from './api.service'; // Adjust the import path as needed

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  // Define the endpoint for messages relative to the API service's base URL.
  private messagesEndpoint = 'message';

  constructor(private apiService: ApiService) {}

  /**
   * Retrieve all messages.
   *
   * This delegates the GET request to the ApiService.
   */
  getMessages(): Observable<Message[]> {
    return this.apiService.get<Message[]>(this.messagesEndpoint);
  }

  /**
   * Send a new message.
   *
   * This delegates the POST request to the ApiService.
   *
   * @param message Partial message data to be sent.
   */
  sendMessage(message: Partial<Message>): Observable<Message> {
    return this.apiService.post<Message>(this.messagesEndpoint, message);
  }

  /**
   * Mark a message as read.
   *
   * This delegates the PUT request to the ApiService by appending `/read`
   * to the message endpoint.
   *
   * @param messageId The unique identifier of the message to mark as read.
   */
  markAsRead(messageId: number): Observable<any> {
    const endpoint = `${this.messagesEndpoint}/${messageId}/read`;
    return this.apiService.put(endpoint, {});
  }
}