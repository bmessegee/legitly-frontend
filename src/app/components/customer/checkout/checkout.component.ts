import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Observable, firstValueFrom } from 'rxjs';

import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { StripeService } from '../../../services/stripe.service';
import { CartItem, Order, OrderItem, OrderStatus, CustomerDetails } from '../../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  @ViewChild('cardElement') cardElement!: ElementRef;

  cartItems$: Observable<CartItem[]>;
  cartTotal$: Observable<number>;
  
  customerForm: FormGroup;
  paymentForm: FormGroup;
  
  isProcessing = false;
  stripe: any;
  card: any;
  
  cartItems: CartItem[] = [];
  cartTotal = 0;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private stripeService: StripeService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.cartTotal$ = this.cartService.cartTotal$;

    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]]
    });

    this.paymentForm = this.fb.group({
      nameOnCard: ['', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    this.loadCartData();
    this.prefillCustomerData();
    this.initializeStripe();
  }

  private loadCartData(): void {
    this.cartItems$.subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        this.snackBar.open('Your cart is empty. Redirecting to dashboard...', 'Close', {
          duration: 3000
        });
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      }
    });

    this.cartTotal$.subscribe(total => {
      this.cartTotal = total;
    });
  }

  private prefillCustomerData(): void {
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.customerForm.patchValue({
        firstName: currentUser.givenName || '',
        lastName: currentUser.familyName || '',
        email: currentUser.email || ''
      });
    }
  }

  private async initializeStripe(): Promise<void> {
    try {
      if (!this.stripeService.isStripeAvailable()) {
        throw new Error('Stripe is not available');
      }

      this.stripe = this.stripeService.getStripe();
      
      // Create card element
      this.card = this.stripeService.createElement('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
        },
      });

      // Wait for the view to be ready
      setTimeout(() => {
        if (this.cardElement) {
          this.card.mount(this.cardElement.nativeElement);
          
          this.card.on('change', (event: any) => {
            if (event.error) {
              this.snackBar.open(event.error.message, 'Close', {
                duration: 5000
              });
            }
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      this.snackBar.open('Payment system unavailable. Please try again later.', 'Close', {
        duration: 5000
      });
    }
  }

  async processPayment(): Promise<void> {
    if (!this.isFormValid()) {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000
      });
      return;
    }

    this.isProcessing = true;

    try {
      // Create payment intent on your backend
      const paymentIntent = await this.createPaymentIntent();
      
      // Confirm payment with Stripe
      const { error, paymentIntent: confirmedPayment } = await this.stripeService.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: this.card,
            billing_details: {
              name: this.paymentForm.get('nameOnCard')?.value,
              email: this.customerForm.get('email')?.value,
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (confirmedPayment.status === 'succeeded') {
        await this.createOrder(confirmedPayment.id);
        this.showSuccessAndRedirect();
      }
    } catch (error: any) {
      this.snackBar.open(
        error.message || 'Payment failed. Please try again.',
        'Close',
        { duration: 5000 }
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async createPaymentIntent(): Promise<any> {
    const request = {
      amount: Math.round(this.cartTotal * 100), // Amount in cents
      currency: 'usd',
      customer_email: this.customerForm.get('email')?.value,
      metadata: {
        customer_id: this.authService.currentUser?.sub || '',
        item_count: this.cartItems.length.toString()
      }
    };

    return firstValueFrom(this.stripeService.createPaymentIntent(request));
  }

  private async createOrder(paymentId: string): Promise<void> {
    const customerDetails: CustomerDetails = {
      FirstName: this.customerForm.get('firstName')?.value,
      LastName: this.customerForm.get('lastName')?.value,
      Email: this.customerForm.get('email')?.value,
      PhoneNumber: this.customerForm.get('phoneNumber')?.value
    };

    const orderItems: OrderItem[] = this.cartItems.map(item => ({
      ProductId: item.ProductId,
      ProductName: item.ProductName,
      Description: item.Description,
      Price: item.Price,
      Quantity: item.Quantity,
      LineTotal: item.Price * item.Quantity
    }));

    const order: Partial<Order> = {
      CustomerId: this.authService.currentUser?.sub || '',
      PaymentId: paymentId,
      Status: OrderStatus.Submitted,
      TotalAmount: this.cartTotal,
      OrderItems: orderItems,
      CustomerDetails: customerDetails
    };

    try {
      await firstValueFrom(this.orderService.createOrder(order as Order));
      this.cartService.clearCart();
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  public isFormValid(): boolean {
    return this.customerForm.valid && this.paymentForm.valid && this.cartItems.length > 0;
  }

  private showSuccessAndRedirect(): void {
    this.snackBar.open('Payment successful! Order created.', 'View Orders', {
      duration: 5000
    }).onAction().subscribe(() => {
      this.router.navigate(['/orders']);
    });

    setTimeout(() => {
      this.router.navigate(['/orders']);
    }, 3000);
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  getItemTotal(item: CartItem): number {
    return item.Price * item.Quantity;
  }
}