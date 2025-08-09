import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../../services/order.service';
import { CartService } from '../../../../services/cart.service';
import { Order } from '../../../../models/order.model';
import { DatePipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-order-item',
  imports: [ 
    DatePipe,
    JsonPipe,
    NgFor,
    NgIf,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './order-item.component.html',
  styleUrl: './order-item.component.scss'
})
export class OrderItemComponent {
  orderService = inject(OrderService);
  cartService = inject(CartService);
  router = inject(Router);
  
  @Input() order: Order | null = null;

  isExpanded = false;
  expandedItems = new Set<number>();
  expandedFormData = new Map<number, any>();
  error: string | null = null;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  expandOrderItem(itemIndex: number) {
    if (this.expandedItems.has(itemIndex)) {
      // Collapse item
      this.expandedItems.delete(itemIndex);
      this.expandedFormData.delete(itemIndex);
    } else {
      // Expand item - fetch form data
      if (this.order?.OrderId) {
        this.cartService.getOrderItemFormData(this.order.OrderId, itemIndex).subscribe({
          next: (formData) => {
            this.expandedItems.add(itemIndex);
            this.expandedFormData.set(itemIndex, formData);
          },
          error: (error) => {
            console.error('Error loading form data:', error);
            this.error = 'Failed to load form data';
          }
        });
      }
    }
  }

  editOrderItem(itemIndex: number) {
    if (this.order?.OrderId) {
      // Navigate to product form with order ID and item index
      this.router.navigate(['/product'], {
        queryParams: {
          query: this.order.OrderItems[itemIndex].FormType,
          orderId: this.order.OrderId,
          itemIndex: itemIndex
        }
      });
    }
  }

  editOrder() {
    if (this.order?.OrderId) {
      this.router.navigate(['/product'], {
        queryParams: {
          orderId: this.order.OrderId
        }
      });
    }
  }

  canEdit(): boolean {
    return this.order?.Status === 'Created' || this.order?.Status === 'Submitted';
  }

  // Legacy method for backward compatibility
  expandOrder() {
    this.toggleExpand();
  }
}
