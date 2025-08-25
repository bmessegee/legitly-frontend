import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartItem, Order, Cart, OrderStatus } from '../models/order.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'legitly_cart';
  private readonly ORDERS_STORAGE_KEY = 'legitly_orders';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);
  private ordersSubject = new BehaviorSubject<Order[]>([]);

  constructor(private apiService: ApiService) {
    this.loadCartFromStorage();
    this.loadOrdersFromStorage();
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
        const total = items.reduce((sum, item) => {
          const price = Number(item.Price) || 0;
          const quantity = Number(item.Quantity) || 0;
          return sum + (price * quantity);
        }, 0);
        observer.next(total);
      });
    });
  }

  get orders$(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
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
        Quantity: 1,
        CartItemId: this.generateCartItemId(),
        AddedToCart: new Date(),
        IsExpandable: false
      };
      currentItems.push(newItem);
    }

    this.updateCart(currentItems);
  }

  // New method to add form submissions to cart
  addFormToCart(formData: {
    ProductId: string;
    ProductName: string;
    Description: string;
    Price: number;
    FormData: any;
    FormType: string;
    FormTitle?: string;
    OrderId?: string;
  }): Observable<CartItem> {
    const cartItem: CartItem = {
      ProductId: formData.ProductId,
      ProductName: formData.ProductName,
      Description: formData.Description,
      Price: formData.Price,
      Quantity: 1,
      FormData: formData.FormData,
      FormType: formData.FormType,
      FormTitle: formData.FormTitle || formData.ProductName,
      FormSummary: this.generateFormSummary(formData.FormData, formData.FormType),
      IsExpandable: true,
      CartItemId: this.generateCartItemId(),
      AddedToCart: new Date(),
      OrderId: formData.OrderId
    };

    // Add to backend cart
    return this.apiService.post<CartItem>('cart/items', cartItem).pipe(
      tap(backendItem => {
        // Add to local cart as well
        const currentItems = this.cartItemsSubject.value;
        currentItems.push(backendItem);
        this.updateCart(currentItems);
      })
    );
  }

  removeFromCart(productId: string): void {
    const currentItems = this.cartItemsSubject.value;
    const itemToRemove = currentItems.find(item => item.ProductId === productId);
    const updatedItems = currentItems.filter(item => item.ProductId !== productId);
    
    this.updateCart(updatedItems);
    
    // If the removed item has an OrderId, revert it to in-progress status
    if (itemToRemove?.OrderId) {
      this.revertOrderToInProgress(itemToRemove.OrderId);
    }
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
    const currentItems = this.cartItemsSubject.value;
    
    // Revert all orders with OrderIds back to in-progress status
    currentItems.forEach(item => {
      if (item.OrderId) {
        this.revertOrderToInProgress(item.OrderId);
      }
    });
    
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
    return items.reduce((sum, item) => {
      const price = Number(item.Price) || 0;
      const quantity = Number(item.Quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  }

  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.cartCountSubject.next(items.reduce((sum, item) => sum + (Number(item.Quantity) || 0), 0));
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

  addOrder(order: Order): void {
    const currentOrders = this.ordersSubject.value;
    const existingOrderIndex = currentOrders.findIndex(o => o.OrderId === order.OrderId);
    
    if (existingOrderIndex > -1) {
      currentOrders[existingOrderIndex] = order;
    } else {
      currentOrders.push(order);
    }
    
    this.updateOrders(currentOrders);
  }

  getOrders(): Order[] {
    return this.ordersSubject.value;
  }

  getOrder(orderId: string): Order | undefined {
    return this.ordersSubject.value.find(order => order.OrderId === orderId);
  }

  removeOrder(orderId: string): void {
    const currentOrders = this.ordersSubject.value;
    const updatedOrders = currentOrders.filter(order => order.OrderId !== orderId);
    this.updateOrders(updatedOrders);
  }

  private updateOrders(orders: Order[]): void {
    this.ordersSubject.next(orders);
    this.saveOrdersToStorage(orders);
  }

  private saveOrdersToStorage(orders: Order[]): void {
    try {
      localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders to localStorage:', error);
    }
  }

  private loadOrdersFromStorage(): void {
    try {
      const storedOrders = localStorage.getItem(this.ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const orders: Order[] = JSON.parse(storedOrders);
        this.updateOrders(orders);
      }
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
    }
  }

  // Convert cart to order (checkout)
  convertCartToOrder(): Observable<Order> {
    return this.apiService.post<Order>('cart/checkout', {});
  }

  // Get backend cart
  getBackendCart(): Observable<Cart> {
    return this.apiService.get<Cart>('cart');
  }

  // Clear backend cart
  clearBackendCart(): Observable<any> {
    return this.apiService.delete('cart');
  }

  // Get order item form data for expanding
  getOrderItemFormData(orderId: string, itemIndex: number): Observable<any> {
    return this.apiService.get(`orders/${orderId}/items/${itemIndex}/form-data`);
  }

  // Helper methods
  private generateCartItemId(): string {
    return 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private generateFormSummary(formData: any, formType: string): string {
    if (formType === 'llc-formation' && formData?.companyInformation?.llcName) {
      const llcName = formData.companyInformation.llcName;
      const formationType = formData.companyInformation.certificateOfFormation || 'standard';
      return `Company: ${llcName}, Filing: ${formationType}`;
    }
    return 'Form data available';
  }

  // Add an existing order to cart
  addOrderToCart(order: Order): boolean {
    console.log('CartService: Adding order to cart', order.OrderId);
    
    if (order.OrderItems.length === 0) {
      console.log('CartService: Order has no items');
      return false;
    }
    
    const currentItems = this.cartItemsSubject.value;
    // Check if this order is already in cart
    const existingIndex = currentItems.findIndex(item => item.OrderId === order.OrderId);
    
    if (existingIndex !== -1) {
      console.log('CartService: Order already in cart');
      return false; // Already in cart
    }
    
    const firstItem = order.OrderItems[0];
    const cartItem: CartItem = {
      ProductId: firstItem.ProductId,
      ProductName: firstItem.ProductName,
      Description: firstItem.Description,
      Price: firstItem.Price,
      Quantity: firstItem.Quantity,
      FormData: firstItem.FormData,
      FormType: firstItem.FormType,
      FormTitle: firstItem.FormTitle || firstItem.ProductName,
      FormSummary: firstItem.FormSummary,
      IsExpandable: firstItem.IsExpandable || true,
      CartItemId: this.generateCartItemId(),
      AddedToCart: new Date(),
      OrderId: order.OrderId
    };

    // Add new item to cart
    currentItems.push(cartItem);
    this.updateCart(currentItems);
    
    console.log('CartService: Order added to cart successfully', {
      orderId: order.OrderId,
      cartItemId: cartItem.CartItemId,
      cartItemCount: currentItems.length
    });
    
    return true; // Successfully added
  }

  private revertOrderToInProgress(orderId: string): void {
    // Make API call to revert order status back to Created (in-progress)
    this.apiService.put(`order/${orderId}/status`, { status: OrderStatus.Created }).subscribe({
      next: () => {
        console.log(`Order ${orderId} reverted to in-progress status`);
      },
      error: (error) => {
        console.error(`Error reverting order ${orderId} status:`, error);
      }
    });
  }
}