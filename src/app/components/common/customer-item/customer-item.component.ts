import { Component, inject, Input } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer.model';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DocumentsComponent } from "../documents/documents.component";
import { OrdersComponent } from "../orders/orders.component";
import { MessagesComponent } from "../messages/messages.component";

@Component({
  selector: 'app-customer-item',
  imports: [
    DatePipe,
    MatIconModule,
    MatButtonModule,
    DocumentsComponent,
    OrdersComponent,
    MessagesComponent
],
  templateUrl: './customer-item.component.html',
  styleUrl: './customer-item.component.scss'
})
export class CustomerItemComponent {
 customerService = inject(CustomerService);

  // The document model for this item
  @Input() customer: Customer | null = null;
}
