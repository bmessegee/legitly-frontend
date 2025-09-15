import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Order, OrderStatus, OrderItem } from '../../../../models/order.model';

@Component({
  selector: 'app-tenant-order-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatExpansionModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './tenant-order-item.component.html',
  styleUrls: ['./tenant-order-item.component.scss']
})
export class TenantOrderItemComponent {
  @Input() order: Order | null = null;
  @Input() showStatusControls: boolean = true;
  
  @Output() statusUpdate = new EventEmitter<{order: Order, status: OrderStatus}>();
  @Output() viewCustomer = new EventEmitter<string>();

  OrderStatus = OrderStatus;
  isExpanded = false;
  expandedItems = new Set<number>();

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
      case OrderStatus.Submitted: return 'warn';
      case OrderStatus.Processing: return 'accent';
      case OrderStatus.Completed: return 'primary';
      case OrderStatus.Rejected: return 'warn';
      default: return '';
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Submitted: return 'new_releases';
      case OrderStatus.Processing: return 'work';
      case OrderStatus.Completed: return 'check_circle';
      case OrderStatus.Rejected: return 'cancel';
      default: return 'help';
    }
  }

  getItemNames() {
    return this.order?.OrderItems?.map(item => item.ProductName).join(', ')
  }
  getAvailableStatuses(): {value: OrderStatus, label: string}[] {
    if (!this.order) return [];
    
    const current = this.order.Status;
    const statuses: {value: OrderStatus, label: string}[] = [];
    
    // From Submitted, can go to Processing or Rejected
    if (current === OrderStatus.Submitted) {
      statuses.push(
        { value: OrderStatus.Processing, label: 'Start Processing' },
        { value: OrderStatus.Rejected, label: 'Reject Order' }
      );
    }
    
    // From Processing, can go to Completed or back to Submitted
    if (current === OrderStatus.Processing) {
      statuses.push(
        { value: OrderStatus.Completed, label: 'Mark Completed' },
        { value: OrderStatus.Submitted, label: 'Return to Queue' }
      );
    }
    
    return statuses;
  }

  updateStatus(newStatus: OrderStatus): void {
    if (this.order) {
      this.statusUpdate.emit({ order: this.order, status: newStatus });
    }
  }

  onViewCustomer(): void {
    if (this.order?.CustomerId) {
      this.viewCustomer.emit(this.order.CustomerId);
    }
  }

  toggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleOrderItem(itemIndex: number): void {
    if (this.expandedItems.has(itemIndex)) {
      this.expandedItems.delete(itemIndex);
    } else {
      this.expandedItems.add(itemIndex);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }

  hasFormData(item: OrderItem): boolean {
    return !!(item.FormData && item.FormType);
  }

  getFormSummary(item: OrderItem): string {
    if (!item.FormData || !item.FormType) return 'No form data';
    
    // LLC formation specific summary
    if (item.FormType.includes('llc') && item.FormData.companyInformation?.llcName) {
      return `Company: ${item.FormData.companyInformation.llcName}`;
    }
    
    return item.FormSummary || 'Form data available';
  }

  trackByItemIndex(index: number): number {
    return index;
  }
}