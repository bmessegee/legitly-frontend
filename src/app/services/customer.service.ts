import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service'; // Adjust the import path as needed
import { Customer } from '../models/customer.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    // Define the endpoint for messages relative to the API service's base URL.
    private endpoint = 'customer';
    private customer?: Customer | null;
    private _cust$ = new BehaviorSubject<Customer | null>(null);
    
      /** Streams for components to consume */
    customer$: Observable<Customer | null> = this._cust$.asObservable();

    constructor(private apiService: ApiService, private authService: AuthService) {
        // Initialize customer data when service is created and user is authenticated
        this.authService.isAuthenticated$.subscribe(isAuth => {
            if (isAuth && this.authService.isCustomerUser()) {
                // Small delay to ensure auth context is fully loaded
                setTimeout(() => this.getCustomerForUser(), 300);
            }
        });
    }

    getCurrentUserAsCustomer(): Customer | null {
        if (!this.authService.isCustomerUser()) {
            return null;
        }
        
        var user = this.authService.currentUser;
        if (!user) {
            return null;
        }
        
        // Return cached customer if available
        if (this.customer) {
            return this.customer;
        }
        
        // Try to fetch customer from API if we have user data but no customer
        if (!this.customer && user.sub) {
            this.getCustomerForUser();
        }
        
        // If customer isn't loaded from API yet and we have customerId, create one from user data
        if (user.customerId && user.tenantId) {
            const customer: Customer = {
                CustomerId: user.customerId, 
                TenantId: user.tenantId,                 
                Name: `${user.givenName ?? ''} ${user.familyName ?? ''}`.trim(),
                CustomerEmail: user.email ?? '',
                Created: new Date(),
                Updated: new Date(),
                CreatedBy: user.userId || '',
                UpdatedBy: user.userId || '',
            };
            return customer;
        }
        
        return null;
    }

    // Called to initialize the customer if exists
    getCustomerForUser(): void {
    
        if (!this.authService.isCustomerUser()) {
            return;
        }
        const user = this.authService.currentUser;
        if (!user) {
            return;
        }

        // Fetch current user's customer data using GET /customer
        this.apiService.get<Customer[]>(this.endpoint).subscribe({
            next: cust => {
                
                this.customer = cust[0];
                this._cust$.next(this.customer);
                
                // Update user with customer information if needed
                if (this.authService.currentUser && this.customer.CustomerId) {
                    this.authService.currentUser.customerId = this.customer.CustomerId;
                    this.authService.currentUser.tenantId = this.customer.TenantId;
                }
            },
            error: err => {
                console.error('Failed to fetch customer data:', err);
                console.log('Customer may need to be created in backend for user:', user?.sub);
            }
        });
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