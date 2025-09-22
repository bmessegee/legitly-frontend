import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { TenantOrderItemComponent } from './tenant-order-item/tenant-order-item.component';
import { ReadonlyFormViewerComponent } from '../../common/readonly-form-viewer/readonly-form-viewer.component';

@Component({
  selector: 'app-tenant-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDialogModule,
    TenantOrderItemComponent
  ],
  templateUrl: './tenant-orders.component.html',
  styleUrls: ['./tenant-orders.component.scss']
})
export class TenantOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // Add back BehaviorSubject and filtered observables
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable();
  
  // Filtered observables
  newOrders$: Observable<Order[]>;
  processingOrders$: Observable<Order[]>;
  completedOrders$: Observable<Order[]>;
  allOrders$: Observable<Order[]>;
  activeOrders$: Observable<Order[]>;
  
  // Keep simple array for template (for now)
  orders: Order[] = [];
  loading = true;
  error: string | null = null;
  selectedTab = 0;
  
  // Make OrderStatus enum available in template
  OrderStatus = OrderStatus;

  constructor() {
    // Initialize filtered order streams
    this.newOrders$ = this.orders$.pipe(
      map(orders => orders.filter(order => order.Status === OrderStatus.Submitted))
    );
    
    this.processingOrders$ = this.orders$.pipe(
      map(orders => orders.filter(order => order.Status === OrderStatus.Processing))
    );
    
    this.completedOrders$ = this.orders$.pipe(
      map(orders => orders.filter(order => 
        order.Status === OrderStatus.Completed || order.Status === OrderStatus.Rejected))
    );
    
    this.allOrders$ = this.orders$.pipe(
      map(orders => orders.filter(order => 
        order.Status !== OrderStatus.Created && order.Status !== OrderStatus.InCart))
    );
    
    this.activeOrders$ = this.orders$.pipe(
      map(orders => orders.filter(order => 
        order.Status === OrderStatus.Submitted || order.Status === OrderStatus.Processing))
    );
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;
    
    // Load all orders for tenant processing (excluding Created/InCart which are customer drafts)
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        // Filter to only show orders that are submitted or beyond (exclude customer drafts)
        const relevantOrders = orders.filter(order => 
          order.Status !== OrderStatus.Created && order.Status !== OrderStatus.InCart
        );
        
        // Update both the BehaviorSubject and the simple array
        this.ordersSubject.next(relevantOrders);
        this.orders = relevantOrders;
        this.loading = false;
        
        console.log('Loaded tenant orders:', relevantOrders.length, 'orders');
      },
      error: (err) => {
        console.error('Error loading tenant orders:', err);
        this.error = 'Failed to load orders';
        this.loading = false;
        
        this.snackBar.open('Failed to load orders', 'Retry', {
          duration: 5000
        }).onAction().subscribe(() => {
          this.loadOrders();
        });
      }
    });
  }

  refreshOrders(): void {
    this.loadOrders();
  }

  // Simple getter methods for now
  get newOrders(): Order[] {
    return this.orders.filter(order => order.Status === OrderStatus.Submitted);
  }

  get processingOrders(): Order[] {
    return this.orders.filter(order => order.Status === OrderStatus.Processing);
  }

  get completedOrders(): Order[] {
    return this.orders.filter(order => 
      order.Status === OrderStatus.Completed || order.Status === OrderStatus.Rejected);
  }

  updateOrderStatus(order: Order, newStatus: OrderStatus): void {
    const updatedOrder = { ...order, Status: newStatus, Updated: new Date() };
    
    this.orderService.updateOrder(updatedOrder).subscribe({
      next: (updated) => {
        // Update the order in our local list
        const currentOrders = this.ordersSubject.value;
        const index = currentOrders.findIndex(o => o.OrderId === updated.OrderId);
        if (index > -1) {
          currentOrders[index] = updated;
          this.ordersSubject.next([...currentOrders]);
        }
        
        // Also update simple array
        const arrayIndex = this.orders.findIndex(o => o.OrderId === updated.OrderId);
        if (arrayIndex > -1) {
          this.orders[arrayIndex] = updated;
        }
        
        this.snackBar.open(`Order status updated to ${this.getStatusLabel(newStatus)}`, 'Close', {
          duration: 3000
        });
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        this.snackBar.open('Failed to update order status', 'Close', {
          duration: 3000
        });
      }
    });
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Submitted: return 'New Order';
      case OrderStatus.Processing: return 'In Progress';
      case OrderStatus.Completed: return 'Completed';
      case OrderStatus.Rejected: return 'Rejected';
      default: return status;
    }
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Submitted: return 'primary';
      case OrderStatus.Processing: return 'accent';
      case OrderStatus.Completed: return 'primary';
      case OrderStatus.Rejected: return 'warn';
      default: return '';
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Submitted: return 'assignment_turned_in';
      case OrderStatus.Processing: return 'work_history';
      case OrderStatus.Completed: return 'check_circle';
      case OrderStatus.Rejected: return 'cancel';
      default: return 'help_outline';
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Submitted: return 'status-submitted';
      case OrderStatus.Processing: return 'status-processing';
      case OrderStatus.Completed: return 'status-completed';
      case OrderStatus.Rejected: return 'status-rejected';
      default: return 'status-unknown';
    }
  }

  viewCustomer(customerId: string): void {
    this.router.navigate(['/tenant/customers'], { 
      queryParams: { highlight: customerId } 
    });
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  // SAFE: Method that returns stable values based on input (no timestamps or random values)
  getOrderItemNames(order: Order): string {
    return order.OrderItems?.map(item => item.ProductName).join(', ') || 'No items';
  }

  trackByOrderId(index: number, order: Order): string {
    return order.OrderId;
  }

  // View form details for an order item
  viewOrderItemDetails(order: Order, orderItemIndex: number) {
    if (!order.OrderItems || !order.OrderItems[orderItemIndex]) {
      return;
    }

    const orderItem = order.OrderItems[orderItemIndex];
    
    // Only show if the order item has form data
    if (!orderItem.FormData || Object.keys(orderItem.FormData).length === 0) {
      this.snackBar.open('No form data available for this item', 'Close', { duration: 3000 });
      return;
    }

    this.dialog.open(ReadonlyFormViewerComponent, {
      data: {
        orderItem: orderItem
      },
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'readonly-form-dialog'
    });
  }

  // Check if order item has viewable form data
  hasFormData(orderItem: any): boolean {
    return orderItem?.FormData && Object.keys(orderItem.FormData).length > 0;
  }

  // Get the first order item with form data for quick viewing
  getViewableOrderItem(order: Order): any | null {
    if (!order.OrderItems) return null;
    return order.OrderItems.find(item => this.hasFormData(item)) || null;
  }

  // View the first available form data for an order
  viewOrderDetails(order: Order) {
    const viewableItem = this.getViewableOrderItem(order);
    if (viewableItem) {
      const itemIndex = order.OrderItems!.indexOf(viewableItem);
      this.viewOrderItemDetails(order, itemIndex);
    } else {
      this.snackBar.open('No form data available for this order', 'Close', { duration: 3000 });
    }
  }
}