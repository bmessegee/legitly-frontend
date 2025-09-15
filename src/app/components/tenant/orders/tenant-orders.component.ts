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
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { TenantOrderItemComponent } from './tenant-order-item/tenant-order-item.component';

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

  private ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable();
  
  loading = true;
  error: string | null = null;
  selectedTab = 0;

  // Filtered orders by status
  newOrders$: Observable<Order[]>;
  processingOrders$: Observable<Order[]>;
  completedOrders$: Observable<Order[]>;
  allOrders$: Observable<Order[]>;

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
        
        this.ordersSubject.next(relevantOrders);
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

  viewCustomer(customerId: string): void {
    this.router.navigate(['/tenant/customers'], { 
      queryParams: { highlight: customerId } 
    });
  }

  refreshOrders(): void {
    this.loadOrders();
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  trackByOrderId(index: number, order: Order): string {
    return order.OrderId;
  }
}