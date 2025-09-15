import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  orders$: Observable<Order[]>;
  OrderStatus = OrderStatus;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.orders$ = this.orderService.getOrders();
  }

  ngOnInit() {
    // Load orders from server if needed
   // this.loadOrders();
  }

  loadOrders() {
    // TODO: Replace with actual customer ID from auth service
    //const customerId = ;
    
    // For now, we'll use the cart service which loads from localStorage
    // In production, you might want to sync with server data
   // console.log('Loading orders for customer:', customerId);
  }

  editOrder(order: Order) {
    if (order.OrderItems.length > 0) {
      const firstItem = order.OrderItems[0];
      this.router.navigate(['/product'], { 
        queryParams: { 
          query: firstItem.FormType,
          orderId: order.OrderId 
        } 
      });
    }
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.InCart:
        return 'accent';
      case OrderStatus.Created:
        return 'primary';
      case OrderStatus.Submitted:
        return 'accent';
      case OrderStatus.Processing:
        return 'warn';
      case OrderStatus.Completed:
        return 'primary';
      case OrderStatus.Rejected:
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.InCart:
        return 'In Cart';
      case OrderStatus.Created:
        return 'Draft';
      case OrderStatus.Submitted:
        return 'Submitted';
      case OrderStatus.Processing:
        return 'Processing';
      case OrderStatus.Completed:
        return 'Completed';
      case OrderStatus.Rejected:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.InCart:
        return 'shopping_cart';
      case OrderStatus.Created:
        return 'edit';
      case OrderStatus.Submitted:
        return 'send';
      case OrderStatus.Processing:
        return 'hourglass_empty';
      case OrderStatus.Completed:
        return 'check_circle';
      case OrderStatus.Rejected:
        return 'error';
      default:
        return 'help';
    }
  }
}