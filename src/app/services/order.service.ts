import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service'; // Adjust the import path as needed
import { Order } from '../models/order.model';
import { Customer } from '../models/customer.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    // Define the endpoint for messages relative to the API service's base URL.
    private endpoint = 'order';

    constructor(private apiService: ApiService) { }

    /**
     * Retrieve all messages.
     *
     * This delegates the GET request to the ApiService.
     */
    getOrders(): Observable<Order[]> {
        return this.apiService.get<Order[]>(this.endpoint);
    }

    getOrdersForCustomer(customer: Customer): Observable<Order[]> {
        return this.apiService.get<Order[]>(this.endpoint + "?customerId=" + customer.CustomerId );
    }

    getOrder(id: string): Observable<string> {
        return this.apiService.get<string>(this.endpoint + "/" + id);
    }

    /**
     * Create a new order.
     *
     * This delegates the POST request to the ApiService.
     */
    createOrder(order: Order): Observable<Order> {
        return this.apiService.post<Order>(this.endpoint, order);
    }

    /**
     * Update an existing order.
     *
     * This delegates the PUT request to the ApiService.
     */
    updateOrder(order: Order): Observable<Order> {
        return this.apiService.put<Order>(this.endpoint, order);
    }
}