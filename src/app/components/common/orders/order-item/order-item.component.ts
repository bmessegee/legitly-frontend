import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../../services/order.service';
import { CartService } from '../../../../services/cart.service';
import { Order, OrderStatus } from '../../../../models/order.model';
import { DatePipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  snackBar = inject(MatSnackBar);
  
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
      // Expand item - use form data from order item
      this.expandedItems.add(itemIndex);
      const orderItem = this.order?.OrderItems?.[itemIndex];
      if (orderItem?.FormData) {
        this.expandedFormData.set(itemIndex, orderItem.FormData);
      }
    }
  }

  editOrderItem(itemIndex: number) {
    if (this.order?.OrderId) {
      // Navigate to product form with order ID and item index
      this.router.navigate(['/customer/product'], {
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
      this.router.navigate(['/customer/product'], {
        queryParams: {
          orderId: this.order.OrderId
        }
      });
    }
  }

  canEdit(): boolean {
    // Users can edit orders until they're paid (currently no Paid status, so allow edit for all except Processing/Completed)
    return this.order?.Status === OrderStatus.Created || 
           this.order?.Status === OrderStatus.Submitted;
  }

  canDelete(): boolean {
    // Users can delete orders until they're paid (same logic as edit for now)
    return this.order?.Status === OrderStatus.Created || 
           this.order?.Status === OrderStatus.Submitted;
  }

  isInProgress(): boolean {
    return this.order?.Status === OrderStatus.Created;
  }

  isSubmitted(): boolean {
    return this.order?.Status === OrderStatus.Submitted;
  }

  isReadOnly(): boolean {
    // Only truly read-only when processing is complete or failed
    return this.order?.Status === OrderStatus.Processing || 
           this.order?.Status === OrderStatus.Completed || 
           this.order?.Status === OrderStatus.Rejected;
  }

  continueOrder() {
    if (this.order?.OrderId && this.order.OrderItems.length > 0) {
      const firstItem = this.order.OrderItems[0];
      this.router.navigate(['/customer/product'], {
        queryParams: {
          query: firstItem.FormType,
          orderId: this.order.OrderId
        }
      });
    }
  }

  addToCart() {
    if (this.order && this.isSubmitted()) {
      console.log('Adding order to cart:', this.order.OrderId);
      
      this.cartService.loadOrderIntoCart(this.order);
      
      this.snackBar.open(
        `Order "${this.order.DisplayName || this.order.OrderId}" has been added to cart!`,
        'View Cart',
        {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        }
      ).onAction().subscribe(() => {
        this.router.navigate(['/cart']);
      });
    } else {
      console.log('Cannot add to cart - order status:', this.order?.Status);
      this.snackBar.open(
        'Only submitted orders can be added to cart.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        }
      );
    }
  }

  deleteOrder() {
    if (this.order?.OrderId && this.canDelete()) {
      const orderType = this.isInProgress() ? 'draft' : 'submitted';
      if (confirm(`Are you sure you want to delete this ${orderType} order? This action cannot be undone.`)) {
        this.orderService.deleteOrder(this.order.OrderId).subscribe({
          next: () => {
            // Emit event or refresh parent component
            window.location.reload(); // Simple approach, could be improved with proper event handling
          },
          error: (error) => {
            console.error('Error deleting order:', error);
            this.error = 'Failed to delete order';
          }
        });
      }
    }
  }

  // Legacy method for backward compatibility
  expandOrder() {
    this.toggleExpand();
  }
}
