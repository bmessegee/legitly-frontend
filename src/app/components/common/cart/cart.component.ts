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
import { CartItem } from '../../../models/order.model';

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
  cartItems$: Observable<CartItem[]>;
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

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.ProductId, item.Quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.Quantity > 1) {
      this.cartService.updateQuantity(item.ProductId, item.Quantity - 1);
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.ProductId);
    this.snackBar.open(`${item.ProductName} removed from cart`, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.snackBar.open('Cart cleared', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  proceedToCheckout(): void {
    const items = this.cartService.getCartItems();
    if (items.length === 0) {
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

  getItemTotal(item: CartItem): number {
    return item.Price * item.Quantity;
  }
}