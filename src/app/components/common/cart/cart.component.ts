import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
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
    MatSnackBarModule
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

  ngOnInit(): void {}

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
    
    // Navigate to checkout page
    this.router.navigate(['/checkout']);
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