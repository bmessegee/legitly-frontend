import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../../../../services/order.service';
import { OrderStatus } from '../../../../models/order.model';

@Component({
  selector: 'app-checkout-cancel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './checkout-cancel.component.html',
  styleUrls: ['./checkout-cancel.component.scss']
})
export class CheckoutCancelComponent implements OnInit {
  sessionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // Get session_id from query params for reference
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'];
      
      // Clear the StripeSessionId from any orders to prevent incomplete payment detection
      if (this.sessionId) {
        this.clearStripeSessionFromOrders(this.sessionId);
      }
    });
  }

  private clearStripeSessionFromOrders(sessionId: string): void {
    console.log('Clearing Stripe session ID from orders due to payment cancellation:', sessionId);
    
    // Get all orders and find any with this session ID
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        const orderWithSession = orders.find(order => 
          order.StripeSessionId === sessionId && 
          order.Status === OrderStatus.Created
        );

        if (orderWithSession) {
          console.log('Found order with cancelled session, clearing StripeSessionId:', orderWithSession.OrderId);
          
          // Clear the StripeSessionId from the order
          const updatedOrder = { 
            ...orderWithSession, 
            StripeSessionId: undefined 
          };
          
          // Update the order to remove the session ID
          this.orderService.updateOrder(updatedOrder).subscribe({
            next: () => {
              console.log('Successfully cleared StripeSessionId from order:', orderWithSession.OrderId);
            },
            error: (error) => {
              console.error('Error clearing StripeSessionId from order:', error);
              // Don't block the user experience if this fails
            }
          });
        }
      },
      error: (error) => {
        console.error('Error fetching orders to clear session ID:', error);
        // Don't block the user experience if this fails
      }
    });
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/dashboard']);
  }
}