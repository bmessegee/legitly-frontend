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

  currentOrder$: Observable<Order | null>;
  cartItems$: Observable<OrderItem[]>;
  cartTotal$: Observable<number>;
  
  customerForm: FormGroup;
  
  isProcessing = false;
  currentOrder: Order | null = null;
  cartItems: OrderItem[] = [];
  cartTotal = 0;

  // Stripe properties
  private stripe: any;
  private card: any;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private stripeService: StripeService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.currentOrder$ = this.cartService.currentOrder$;
    this.cartItems$ = this.cartService.cartItems$;
    this.cartTotal$ = this.cartService.cartTotal$;

    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]]
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
    if (!this.isCustomerFormValid()) {
      this.snackBar.open('Please fill in all required customer information', 'Close', {
        duration: 3000
      });
      return;
    }

    this.isProcessing = true;

    try {
      // Create order first
      const order = await this.createPendingOrder();
      
      // Create Stripe Checkout session
      const checkoutResponse = await this.createStripeCheckoutSession(order);
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutResponse.sessionUrl;
      
    } catch (error: any) {
      console.error('Error processing payment:', error);
      this.snackBar.open(
        error.message || 'Unable to process payment. Please try again.',
        'Close',
        { duration: 5000 }
      );
      this.isProcessing = false;
    }
  }

  private async createStripeCheckoutSession(order: any): Promise<any> {
    const request = {
      orderId: order.OrderId,
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/cancel`
    };

    return firstValueFrom(this.stripeService.createCheckoutSession(request));
  }

  private async createPendingOrder(): Promise<any> {
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
      Status: OrderStatus.Created, // Start as Created, will be updated after payment
      TotalAmount: this.cartTotal,
      OrderItems: orderItems,
      CustomerDetails: customerDetails
    };

    try {
      const createdOrder = await firstValueFrom(this.orderService.createOrder(order as Order));
      this.cartService.clearCart();
      return createdOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  public isFormValid(): boolean {
    return this.customerForm.valid && this.cartItems.length > 0;
  }

  public isCustomerFormValid(): boolean {
    return this.customerForm.valid && this.cartItems.length > 0;
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  getItemTotal(item: OrderItem): number {
    return item.Price * item.Quantity;
  }
}