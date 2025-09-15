import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, EMPTY } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { CartItem, Order, Cart, OrderStatus, OrderItem } from '../models/order.model';
import { OrderService } from './order.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'legitly_cart_order';
  private currentOrderSubject = new BehaviorSubject<Order | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private orderService: OrderService,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.initializeCart();
  }


  // Observable getters - cart is now based on current order
  get currentOrder$(): Observable<Order | null> {
    return this.currentOrderSubject.asObservable();
  }

  get cartItems$(): Observable<OrderItem[]> {
    return new Observable(observer => {
      this.currentOrderSubject.subscribe(order => {
        observer.next(order?.OrderItems || []);
      });
    });
  }

  get cartCount$(): Observable<number> {
    return new Observable(observer => {
      this.currentOrderSubject.subscribe(order => {
        const count = order?.OrderItems?.reduce((sum, item) => sum + (item.Quantity || 0), 0) || 0;
        observer.next(count);
      });
    });
  }

  get cartTotal$(): Observable<number> {
    return new Observable(observer => {
      this.currentOrderSubject.subscribe(order => {
        const total = order?.OrderItems?.reduce((sum, item) => {
          const price = Number(item.Price) || 0;
          const quantity = Number(item.Quantity) || 0;
          return sum + (price * quantity);
        }, 0) || 0;
        observer.next(total);
      });
    });
  }

  get isLoading$(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }

  get isEmpty$(): Observable<boolean> {
    return new Observable(observer => {
      this.currentOrderSubject.subscribe(order => {
        observer.next(!order || !order.OrderItems || order.OrderItems.length === 0);
      });
    });
  }

  // Initialize cart - load from backend or localStorage
  private initializeCart(): void {
    this.isLoadingSubject.next(true);
    
    // Try to load from backend first
    this.loadCartFromBackend().subscribe({
      next: (order) => {
        this.currentOrderSubject.next(order);
        if (order) {
          this.saveOrderToStorage(order);
        }
        this.isLoadingSubject.next(false);
      },
      error: () => {
        // Fallback to localStorage
        this.loadOrderFromStorage();
        this.isLoadingSubject.next(false);
      }
    });
  }

  // Create new order or get existing cart order
  createOrGetCartOrder(): Observable<Order> {
    const currentOrder = this.currentOrderSubject.value;
    
    if (currentOrder) {
      return of(currentOrder);
    }
    
    // Create new order
    return this.createNewCartOrder();
  }

  // Add product to cart (creates order if needed)
  addToCart(product: { 
    ProductId: string; 
    ProductName: string; 
    Description: string; 
    Price: number;
    Quantity?: number;
    FormData?: any;
    FormType?: string;
    FormTitle?: string;
  }): Observable<Order> {
    return this.createOrGetCartOrder().pipe(
      switchMap(order => {
        const quantity = product.Quantity || 1;
        const newItem: OrderItem = {
          ProductId: product.ProductId,
          ProductName: product.ProductName,
          Description: product.Description,
          Price: product.Price,
          Quantity: quantity,
          LineTotal: product.Price * quantity,
          FormData: product.FormData,
          FormType: product.FormType,
          FormTitle: product.FormTitle,
          FormSummary: this.generateFormSummary(product.FormData, product.FormType),
          IsExpandable: !!product.FormData,
          IsValid: !product.FormType || !product.FormData // Ala carte services (no form) are valid by default
        };

        // Check if item already exists
        const existingItemIndex = order.OrderItems?.findIndex(item => 
          item.ProductId === product.ProductId
        ) ?? -1;

        if (existingItemIndex > -1 && order.OrderItems) {
          // Update existing item - add the requested quantity
          order.OrderItems[existingItemIndex].Quantity += quantity;
          order.OrderItems[existingItemIndex].LineTotal = 
            order.OrderItems[existingItemIndex].Price * order.OrderItems[existingItemIndex].Quantity;
          // Preserve IsValid state for existing items (don't override if already set)
          if (order.OrderItems[existingItemIndex].IsValid === undefined) {
            order.OrderItems[existingItemIndex].IsValid = !product.FormType || !product.FormData;
          }
        } else {
          // Add new item
          order.OrderItems = order.OrderItems || [];
          order.OrderItems.push(newItem);
        }

        // Recalculate order total
        order.TotalAmount = this.calculateOrderTotal(order.OrderItems);
        
        // Save updated order
        return this.saveOrder(order);
      })
    );
  }

  // Remove item from cart
  removeFromCart(productId: string): Observable<Order | null> {
    const currentOrder = this.currentOrderSubject.value;
    
    if (!currentOrder || !currentOrder.OrderItems) {
      return of(null);
    }
    
    // Remove item from order
    currentOrder.OrderItems = currentOrder.OrderItems.filter(item => 
      item.ProductId !== productId
    );
    
    // Recalculate total
    currentOrder.TotalAmount = this.calculateOrderTotal(currentOrder.OrderItems);
    
    // If no items left, clear the cart
    if (currentOrder.OrderItems.length === 0) {
      return this.clearCart();
    }
    
    // Save updated order
    return this.saveOrder(currentOrder);
  }

  // Update item quantity
  updateQuantity(productId: string, quantity: number): Observable<Order | null> {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    
    const currentOrder = this.currentOrderSubject.value;
    
    if (!currentOrder || !currentOrder.OrderItems) {
      return of(null);
    }
    
    const itemIndex = currentOrder.OrderItems.findIndex(item => 
      item.ProductId === productId
    );
    
    if (itemIndex > -1) {
      currentOrder.OrderItems[itemIndex].Quantity = quantity;
      currentOrder.OrderItems[itemIndex].LineTotal = 
        currentOrder.OrderItems[itemIndex].Price * quantity;
      
      // Recalculate total
      currentOrder.TotalAmount = this.calculateOrderTotal(currentOrder.OrderItems);
      
      // Save updated order
      return this.saveOrder(currentOrder);
    }
    
    return of(currentOrder);
  }

  // Clear entire cart
  clearCart(): Observable<null> {
    const currentOrder = this.currentOrderSubject.value;
    
    this.currentOrderSubject.next(null);
    this.clearOrderFromStorage();
    
    // Delete order from backend if it exists
    if (currentOrder?.OrderId) {
      return this.orderService.deleteOrder(currentOrder.OrderId).pipe(
        tap(() => console.log('Cart order deleted from backend')),
        catchError(error => {
          console.error('Error deleting cart order:', error);
          return of(null);
        }),
        switchMap(() => of(null))
      );
    }
    
    return of(null);
  }

  // Get current order (cart)
  getCurrentOrder(): Order | null {
    return this.currentOrderSubject.value;
  }

  // Get cart total
  getCartTotal(): number {
    const order = this.currentOrderSubject.value;
    return order?.TotalAmount || 0;
  }

  // Get cart count
  getCartCount(): number {
    const order = this.currentOrderSubject.value;
    return order?.OrderItems?.reduce((sum, item) => sum + (item.Quantity || 0), 0) || 0;
  }

  // Check if cart is empty
  isEmpty(): boolean {
    const order = this.currentOrderSubject.value;
    return !order || !order.OrderItems || order.OrderItems.length === 0;
  }

  // Public method to refresh cart data from backend
  refreshCart(): Observable<Order | null> {
    this.isLoadingSubject.next(true);
    
    return this.loadCartFromBackend().pipe(
      tap(order => {
        this.currentOrderSubject.next(order);
        if (order) {
          this.saveOrderToStorage(order);
        }
        this.isLoadingSubject.next(false);
      }),
      catchError(() => {
        // Fallback to localStorage
        this.loadOrderFromStorage();
        this.isLoadingSubject.next(false);
        return of(this.currentOrderSubject.value);
      })
    );
  }

  // Stripe checkout integration
  createStripeCheckoutSession(): Observable<{sessionId: string, sessionUrl: string}> {
    const currentOrder = this.currentOrderSubject.value;
    
    if (!currentOrder?.OrderId) {
      throw new Error('No cart order available for checkout');
    }
    
    // No parameters needed - backend will pull cart from database
    return this.apiService.post<{sessionId: string, sessionUrl: string}>('cart/stripe-checkout', {});
  }

  // Backend integration methods
  private createNewCartOrder(): Observable<Order> {
    const newOrder: Partial<Order> = {
      CustomerId: this.authService.currentUser?.sub || '',
      Status: OrderStatus.Created,
      TotalAmount: 0,
      OrderItems: []
    };

    return this.orderService.createOrder(newOrder as Order).pipe(
      tap(order => {
        this.currentOrderSubject.next(order);
        this.saveOrderToStorage(order);
      })
    );
  }

  private saveOrder(order: Order): Observable<Order> {
    return this.orderService.updateOrder(order).pipe(
      tap(updatedOrder => {
        this.currentOrderSubject.next(updatedOrder);
        this.saveOrderToStorage(updatedOrder);
      })
    );
  }

  private loadCartFromBackend(): Observable<Order | null> {
    // Look for any existing cart order (Created status) for current user
    return this.orderService.getOrders().pipe(
      switchMap(orders => {
        const cartOrder = orders.find(order => 
          order.Status === OrderStatus.Created && 
          order.CustomerId === this.authService.currentUser?.customerId
        );
        return of(cartOrder || null);
      }),
      catchError(error => {
        console.error('Error loading cart from backend:', error);
        return of(null);
      })
    );
  }

  // LocalStorage integration methods
  private saveOrderToStorage(order: Order): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(order));
    } catch (error) {
      console.error('Error saving cart order to localStorage:', error);
    }
  }

  private loadOrderFromStorage(): void {
    try {
      const storedOrder = localStorage.getItem(this.CART_STORAGE_KEY);
      if (storedOrder) {
        const order: Order = JSON.parse(storedOrder);
        this.currentOrderSubject.next(order);
      }
    } catch (error) {
      console.error('Error loading cart order from localStorage:', error);
    }
  }

  private clearOrderFromStorage(): void {
    try {
      localStorage.removeItem(this.CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart order from localStorage:', error);
    }
  }

  // Load existing order into cart (for resuming)
  loadOrderIntoCart(order: Order): void {
    if (order.Status === OrderStatus.Created) {
      this.currentOrderSubject.next(order);
      this.saveOrderToStorage(order);
    }
  }

  // Utility methods
  private calculateOrderTotal(orderItems: OrderItem[]): number {
    return orderItems.reduce((sum, item) => {
      const price = Number(item.Price) || 0;
      const quantity = Number(item.Quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  }

  private generateFormSummary(formData: any, formType?: string): string {
    if (!formData || !formType) {
      return '';
    }
    
    if (formType === 'llc-formation' && formData?.companyInformation?.llcName) {
      const llcName = formData.companyInformation.llcName;
      const formationType = formData.companyInformation.certificateOfFormation || 'standard';
      return `Company: ${llcName}, Filing: ${formationType}`;
    }
    
    if (formType.includes('llc-') && formData?.companyInformation?.llcName) {
      return `Company: ${formData.companyInformation.llcName}`;
    }
    
    return 'Form data available';
  }
}