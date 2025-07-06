import { NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CustomerItemComponent } from '../../common/customer-item/customer-item.component';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer.model';

@Component({
  selector: 'app-customers',
  imports: [
    NgIf, 
    NgFor, 
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    CustomerItemComponent
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  private customerService = inject(CustomerService);
   
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = true;
  error: string | null = null;
  filterText = '';

  ngOnInit(): void {
    this.customerService.getCustomers().subscribe({
      next: docs => {
        this.customers = docs;
        this.filteredCustomers = docs;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load customers';
        console.error(err);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    if (!this.filterText.trim()) {
      this.filteredCustomers = this.customers;
    } else {
      const filterLower = this.filterText.toLowerCase();
      this.filteredCustomers = this.customers.filter(customer =>
        customer.Name?.toLowerCase().includes(filterLower)
      );
    }
  }

  clearFilter(): void {
    this.filterText = '';
    this.filteredCustomers = this.customers;
  }
}
