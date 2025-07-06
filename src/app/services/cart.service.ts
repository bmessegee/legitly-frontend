import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'legitly_cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);

  constructor() {
    this.loadCartFromStorage();
  }

  get cartItems$(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  get cartCount$(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  get cartTotal$(): Observable<number> {
    return new Observable(observer => {
      this.cartItemsSubject.subscribe(items => {
        const total = items.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
        observer.next(total);
      });
    });
  }

  addToCart(product: { ProductId: string; ProductName: string; Description: string; Price: number }): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItemIndex = currentItems.findIndex(item => item.ProductId === product.ProductId);

    if (existingItemIndex > -1) {
      // Item exists, increment quantity
      currentItems[existingItemIndex].Quantity += 1;
    } else {
      // New item, add to cart
      const newItem: CartItem = {
        ProductId: product.ProductId,
        ProductName: product.ProductName,
        Description: product.Description,
        Price: product.Price,
        Quantity: 1
      };
      currentItems.push(newItem);
    }

    this.updateCart(currentItems);
  }

  removeFromCart(productId: string): void {
    const currentItems = this.cartItemsSubject.value;
    const updatedItems = currentItems.filter(item => item.ProductId !== productId);
    this.updateCart(updatedItems);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItemsSubject.value;
    const itemIndex = currentItems.findIndex(item => item.ProductId === productId);

    if (itemIndex > -1) {
      currentItems[itemIndex].Quantity = quantity;
      this.updateCart(currentItems);
    }
  }

  clearCart(): void {
    this.updateCart([]);
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  getCartCount(): number {
    return this.cartCountSubject.value;
  }

  getCartTotal(): number {
    const items = this.cartItemsSubject.value;
    return items.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
  }

  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.cartCountSubject.next(items.reduce((sum, item) => sum + item.Quantity, 0));
    this.saveCartToStorage(items);
  }

  private saveCartToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (storedCart) {
        const items: CartItem[] = JSON.parse(storedCart);
        this.updateCart(items);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }
}