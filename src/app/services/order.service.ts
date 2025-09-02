import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order, OrderItem, OrderStatus } from '../models/order.model';
import { Customer } from '../models/customer.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private endpoint = 'order';

    constructor(private apiService: ApiService) { }

    getOrders(): Observable<Order[]> {
        return this.apiService.get<Order[]>(this.endpoint);
    }

    getOrdersForCustomer(customer: Customer): Observable<Order[]> {
        return this.apiService.get<Order[]>(this.endpoint + "?customerId=" + customer.CustomerId );
    }

    getOrder(id: string): Observable<Order> {
        return this.apiService.get<Order>(this.endpoint + "/" + id);
    }

    createOrder(order: Order): Observable<Order> {
        return this.apiService.post<Order>(this.endpoint, order);
    }

    updateOrder(order: Order): Observable<Order> {
        return this.apiService.put<Order>(this.endpoint + "/" + order.OrderId, order);
    }

    deleteOrder(id: string): Observable<any> {
        return this.apiService.delete(this.endpoint + "/" + id);
    }

    createOrderFromForm(formData: any, formType: string, productId: string, productName: string, price: number, customerId: string): Order {
        const orderItem: OrderItem = {
            ProductId: productId,
            ProductName: productName,
            Description: productName,
            Price: price,
            Quantity: 1,
            LineTotal: price,
            FormData: formData,
            FormType: formType
        };

        return {
            OrderId: '',
            CustomerId: customerId,
            TenantProcessorId: '',
            PaymentId: '',
            OrderFormId: '',
            Status: OrderStatus.Created,
            TotalAmount: price,
            OrderItems: [orderItem],
            CustomerDetails: {
                FirstName: '',
                LastName: '',
                Email: '',
                PhoneNumber: ''
            },
            Created: new Date(),
            Updated: new Date(),
            CreatedBy: customerId,
            UpdatedBy: customerId
        };
    }

    updateOrderFormData(order: Order, formData: any, productId: string): Order {
        const updatedOrder = { ...order };
        const orderItem = updatedOrder.OrderItems.find(item => item.ProductId === productId);
        
        if (orderItem) {
            orderItem.FormData = formData;
            updatedOrder.Updated = new Date();
        }

        return updatedOrder;
    }
}