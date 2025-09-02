import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

declare var Stripe: any;

export interface PaymentIntent {
  client_secret: string;
  amount: number;
  currency: string;
  id: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  customer_email?: string;
  metadata?: { [key: string]: string };
}

export interface CreateCheckoutSessionRequest {
  orderId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  sessionUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: any;
  private publishableKey = environment.stripe.publishableKey;
  
  constructor(private http: HttpClient, private apiService: ApiService) {
    this.initializeStripe();
  }

  private initializeStripe(): void {
    if (typeof Stripe !== 'undefined') {
      this.stripe = Stripe(this.publishableKey);
    }
  }

  getStripe(): any {
    return this.stripe;
  }

  /**
   * Create payment intent on the backend
   * In production, this should call your backend API to create a real payment intent
   */
  createPaymentIntent(request: CreatePaymentIntentRequest): Observable<PaymentIntent> {
    // TODO: Replace with actual backend endpoint
    // return this.http.post<PaymentIntent>('/api/create-payment-intent', request);
    
    // For development/demo purposes, return a mock payment intent
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          client_secret: `pi_mock_${Date.now()}_secret_mock`,
          amount: request.amount,
          currency: request.currency,
          id: `pi_mock_${Date.now()}`
        });
        observer.complete();
      }, 1000); // Simulate network delay
    });
  }

  /**
   * Confirm payment with Stripe
   */
  async confirmCardPayment(clientSecret: string, paymentMethod: any): Promise<any> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    return await this.stripe.confirmCardPayment(clientSecret, paymentMethod);
  }

  /**
   * Create card element
   */
  createElement(type: string, options?: any): any {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    const elements = this.stripe.elements();
    return elements.create(type, options);
  }

  /**
   * Create Stripe Checkout session via backend API
   */
  createCheckoutSession(request: CreateCheckoutSessionRequest): Observable<CheckoutSessionResponse> {
    return this.apiService.post<CheckoutSessionResponse>('cart/stripe-checkout', request);
  }

  /**
   * Validate if Stripe is available
   */
  isStripeAvailable(): boolean {
    return typeof Stripe !== 'undefined' && this.stripe !== null;
  }
}