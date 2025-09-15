import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { OrderItem } from '../../../models/order.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems$: Observable<OrderItem[]>;
  cartTotal$: Observable<number>;
  cartCount$: Observable<number>;

  constructor(
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.cartTotal$ = this.cartService.cartTotal$;
    this.cartCount$ = this.cartService.cartCount$;
  }

  ngOnInit(): void {
    // Cart service automatically initializes in constructor, but let's ensure it's refreshed
    console.log('Cart component initialized - refreshing cart data');
    
    // Explicitly refresh cart data from backend when cart component loads
    this.cartService.refreshCart().subscribe({
      next: (order) => {
        console.log('Cart refreshed successfully:', order?.OrderId || 'No active order');
      },
      error: (error) => {
        console.error('Error refreshing cart:', error);
      }
    });
  }

  increaseQuantity(item: OrderItem): void {
    this.cartService.updateQuantity(item.ProductId, item.Quantity + 1).subscribe({
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.snackBar.open('Error updating quantity', 'Close', { duration: 3000 });
      }
    });
  }

  decreaseQuantity(item: OrderItem): void {
    if (item.Quantity > 1) {
      this.cartService.updateQuantity(item.ProductId, item.Quantity - 1).subscribe({
        error: (error) => {
          console.error('Error updating quantity:', error);
          this.snackBar.open('Error updating quantity', 'Close', { duration: 3000 });
        }
      });
    }
  }

  removeItem(item: OrderItem): void {
    this.cartService.removeFromCart(item.ProductId).subscribe({
      next: () => {
        this.snackBar.open(`${item.ProductName} removed from cart`, 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.snackBar.open('Error removing item', 'Close', { duration: 3000 });
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.snackBar.open('Cart cleared', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
        this.snackBar.open('Error clearing cart', 'Close', { duration: 3000 });
      }
    });
  }

  proceedToCheckout(): void {
    if (this.cartService.isEmpty()) {
      this.snackBar.open('Your cart is empty', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      return;
    }

    // Check if all package forms are complete and valid
    const invalidItems = this.getInvalidPackageItems();
    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map(item => item.ProductName).join(', ');
      this.snackBar.open(
        `Please complete the following forms before checkout: ${itemNames}`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        }
      );
      return;
    }
    
    // Create Stripe checkout session and redirect
    this.cartService.createStripeCheckoutSession().subscribe({
      next: (response) => {
        if (response.sessionUrl) {
          // Redirect to Stripe payment platform
          window.location.href = response.sessionUrl;
        } else {
          this.snackBar.open('Failed to initialize checkout session', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error creating checkout session:', error);
        this.snackBar.open('Checkout failed. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  // Helper method to get invalid package items
  getInvalidPackageItems(): any[] {
    const currentOrder = this.cartService.getCurrentOrder();
    if (!currentOrder || !currentOrder.OrderItems) {
      return [];
    }

    return currentOrder.OrderItems.filter(item => {
      // Only check package forms (items that have FormType and are expandable)
      const isPackageForm = item.FormType && item.IsExpandable;
      if (!isPackageForm) {
        return false; // Ala carte services don't need form completion
      }
      
      // Check if the package form is invalid or incomplete
      return item.IsValid !== true;
    });
  }

  // Helper method to check if an item needs form completion
  isItemValid(item: any): boolean {
    // Ala carte services (no FormType or not expandable) are always valid
    if (!item.FormType || !item.IsExpandable) {
      return true;
    }
    
    // Package forms must be explicitly marked as valid
    return item.IsValid === true;
  }

  continueShopping(): void {
    this.router.navigate(['/dashboard']);
  }

  getItemTotal(item: OrderItem): number {
    const price = Number(item.Price) || 0;
    const quantity = Number(item.Quantity) || 0;
    return price * quantity;
  }
}