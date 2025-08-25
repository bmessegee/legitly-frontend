import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Base URL for your RESTful API
  private baseUrl: string = 'https://58360gsu5l.execute-api.us-east-1.amazonaws.com/prod/';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Constructs HTTP headers including Content-Type, Authorization, and Accept.
   * In a production app, consider retrieving the token from an auth service.
   */
  private getHeaders(): HttpHeaders {
    const token = this.auth.bearerToken;  
    console.log('API Service - Token for headers:', token ? 'Present' : 'Missing');
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    // Only add Authorization header if we have a valid token
    if (token && typeof token === 'string' && token.trim() !== '') {
      return headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn('API Service - No valid token available for Authorization header');
      return headers;
    }
  }

  /**
   * Handles HTTP errors and returns a user-friendly message.
   * You can extend this method to include more detailed logging or error handling.
   */
  private handleError(error: HttpErrorResponse) {
    // Client-side or network error occurred.
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      // Backend returned an unsuccessful response code.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`
      );
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  /**
   * GET request.
   * @param endpoint Relative URL of the API endpoint.
   */
  get<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.get<T>(url, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('GET response:', response)),
        retry(2), // Retry the request up to 2 times in case of errors.
        catchError(this.handleError)
      );
  }

  /**
   * POST request.
   * @param endpoint Relative URL of the API endpoint.
   * @param data Payload to be sent in the request body.
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.post<T>(url, data, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('POST response:', response)),
        catchError(this.handleError)
      );
  }

  /**
   * PUT request.
   * @param endpoint Relative URL of the API endpoint.
   * @param data Payload to be updated.
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.put<T>(url, data, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('PUT response:', response)),
        catchError(this.handleError)
      );
  }

  /**
   * DELETE request.
   * @param endpoint Relative URL of the API endpoint.
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.delete<T>(url, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('DELETE response:', response)),
        catchError(this.handleError)
      );
  }
}