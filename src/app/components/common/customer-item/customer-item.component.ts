import { Component, inject, Input } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer.model';
import { DatePipe, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { DocumentsComponent } from "../documents/documents.component";
import { OrdersComponent } from "../orders/orders.component";
import { MessagesComponent } from "../messages/messages.component";

@Component({
  selector: 'app-customer-item',
  imports: [
    DatePipe,
    NgIf,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatTabsModule,
    DocumentsComponent,
    OrdersComponent,
    MessagesComponent
  ],
  templateUrl: './customer-item.component.html',
  styleUrl: './customer-item.component.scss'
})
export class CustomerItemComponent {
  customerService = inject(CustomerService);

  // The customer model for this item
  @Input() customer: Customer | null = null;
  
  // Track which tabs have been loaded to enable lazy loading
  loadedTabs = {
    orders: false,
    documents: false,
    messages: false
  };

  onTabChange(event: any): void {
    const tabIndex = event.index;
    
    switch (tabIndex) {
      case 0: // Orders tab
        this.loadedTabs.orders = true;
        break;
      case 1: // Documents tab
        this.loadedTabs.documents = true;
        break;
      case 2: // Messages tab
        this.loadedTabs.messages = true;
        break;
    }
  }

  onExpansionOpened(): void {
    // Load the first tab (orders) when expansion panel opens
    this.loadedTabs.orders = true;
  }
}
