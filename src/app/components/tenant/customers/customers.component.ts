import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CustomerItemComponent } from '../../common/customer-item/customer-item.component';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer.model';

@Component({
  selector: 'app-customers',
  imports: [
        NgIf, 
    NgFor, 
    MatButtonModule, 
    CustomerItemComponent
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {
private customerService = inject(CustomerService);
   
  customers: Customer[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.customerService.getCustomers().subscribe({
      next: docs => {
        this.customers = docs;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load customers';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
