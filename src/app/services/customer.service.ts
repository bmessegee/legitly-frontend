import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service'; // Adjust the import path as needed
import { Customer } from '../models/customer.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    // Define the endpoint for messages relative to the API service's base URL.
    private endpoint = 'customer';

    constructor(private apiService: ApiService, private authService: AuthService) { }

    getCurrentUserAsCustomer(): Customer | null {
        if (!this.authService.isCustomerUser()) {
            return null;
        }
        var user = this.authService.currentUser;
        if (!user) {
            return null;
        }
        const customer: Customer = {
            CustomerId: user.customerId || "", 
            TenantId: user.tenantId || "",                 
            CustomerName: `${user.givenName ?? ''} ${user.familyName ?? ''}`.trim(),
            CustomerEmail: user.email ?? '',
            Created: new Date(),
            Updated: new Date(),
            CreatedBy: "",
            UpdatedBy: "",
        };

        return customer;
    }
    /**
     * Retrieve all messages.
     *
     * This delegates the GET request to the ApiService.
     */
    getCustomers(): Observable<Customer[]> {
        return this.apiService.get<Customer[]>(this.endpoint);
    }

}