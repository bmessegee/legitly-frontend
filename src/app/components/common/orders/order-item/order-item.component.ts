import { Component, inject, Input } from '@angular/core';
import { OrderService } from '../../../../services/order.service';
import { Order } from '../../../../models/order.model';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-order-item',
  imports: [ 
    DatePipe, 
    MatIconModule,
    MatButtonModule],
  templateUrl: './order-item.component.html',
  styleUrl: './order-item.component.scss'
})
export class OrderItemComponent {
  orderService = inject(OrderService);
  // The document model for this item
  @Input() order: Order | null = null;

  error: string | null = null;
  expandOrder(){
    // TODO
  }
}
