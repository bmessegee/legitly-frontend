import { Component, inject, Input } from '@angular/core';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';
import { DatePipe, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { OrderItemComponent } from './order-item/order-item.component';
import { Customer } from '../../../models/customer.model';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-orders',
  imports: [
    NgIf,
    MatButtonModule,
    OrderItemComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);

  @Input() customer: Customer | null = null;

  orders: Order[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    if (!this.customer) {
      this.customer = this.customerService.getCurrentUserAsCustomer();
    }
    if (!this.customer) {
      this.orderService.getOrders().subscribe({
        next: docs => {
          this.orders = docs;
          this.loading = false;
        },
        error: err => {
          this.error = 'Failed to load orders';
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.orderService.getOrdersForCustomer(this.customer).subscribe({
        next: docs => {
          this.orders = docs;
          this.loading = false;
        },
        error: err => {
          this.error = 'Failed to load order for customer ' + this.customer?.Name;
          console.error(err);
          this.loading = false;
        }
      });
    }


  }
}
