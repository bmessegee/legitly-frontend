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
    }

    getCurrentUserAsCustomer(): Customer | null {
   
        if (!this.authService.isCustomerUser()) {
            return null;
        }
        var user = this.authService.currentUser;
        if (!user) {
            return null;
        }
        if(this.customer){
            return this.customer;
        }else{
            return null;
        }
        /*     
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
        */
    }

    // Called to initialize the customer if exists
    getCustomerForUser(): void {
        this.apiService.get<Customer>(this.endpoint + "/id").subscribe({
            next: cust => {
                this.customer = cust;
                this._cust$.next(this.customer);
            },
            error: err => {
                console.error(err);
            }
        });;
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