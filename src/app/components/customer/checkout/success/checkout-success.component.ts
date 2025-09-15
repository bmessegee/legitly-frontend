import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../../services/api.service';
import { CartService } from '../../../../services/cart.service';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.scss']
})
export class CheckoutSuccessComponent implements OnInit {
  isLoading = true;
  paymentConfirmed = false;
  errorMessage: string | null = null;
  sessionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Get session_id from query params
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'];
      
      if (this.sessionId) {
        this.confirmPayment(this.sessionId);
      } else {
        this.errorMessage = 'Invalid payment session. Please contact support if you believe this is an error.';
        this.isLoading = false;
      }
    });
  }

  private confirmPayment(sessionId: string): void {
    this.apiService.post(`cart/confirm-payment/${sessionId}`, {}).subscribe({
      next: (response) => {
        console.log('Payment confirmed:', response);
        this.paymentConfirmed = true;
        this.isLoading = false;
        
        // Clear the cart after successful payment
        this.cartService.clearCart().subscribe({
          next: () => console.log('Cart cleared after successful payment'),
          error: (error) => console.error('Error clearing cart:', error)
        });
      },
      error: (error) => {
        console.error('Error confirming payment:', error);
        this.errorMessage = 'There was an issue confirming your payment. Please contact support with your session ID: ' + sessionId;
        this.isLoading = false;
        
        this.snackBar.open('Payment confirmation failed', 'Close', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  goToMessages(): void {
    this.router.navigate(['/messages']);
  }

  goToDocuments(): void {
    this.router.navigate(['/documents']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}