export interface Order {
    OrderId: string;
    CustomerId: string;
    TenantProcessorId: string;
    PaymentId: string;
    OrderFormId: string;
    Status: OrderStatus;
    TotalAmount: number;
    OrderItems: OrderItem[];
    CustomerDetails: CustomerDetails;
    Created: Date;
    Updated: Date;
    CreatedBy: string;
    UpdatedBy: string;
}

export interface OrderItem {
    ProductId: string;
    ProductName: string;
    Description: string;
    Price: number;
    Quantity: number;
    LineTotal: number;
}

export interface CustomerDetails {
    FirstName: string;
    LastName: string;
    Email: string;
    PhoneNumber: string;
}

export enum OrderStatus {
    Created = 'Created',
    Submitted = 'Submitted',
    Processing = 'Processing',
    Completed = 'Completed',
    Rejected = 'Rejected'
}

export interface CartItem {
    ProductId: string;
    ProductName: string;
    Description: string;
    Price: number;
    Quantity: number;
}