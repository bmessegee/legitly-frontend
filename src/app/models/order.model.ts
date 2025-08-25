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
    DisplayName?: string; // Friendly display name for UI
    Description?: string; // Optional description
}

export interface OrderItem {
    ProductId: string;
    ProductName: string;
    Description: string;
    Price: number;
    Quantity: number;
    LineTotal: number;
    FormData?: any; // Store the form data for this product/service
    FormType?: string; // Type of form (e.g., 'llc-formation2')
    FormTitle?: string; // Friendly display title for the form
    FormSummary?: string; // Summary of key form data for display
    IsExpandable?: boolean; // Flag to indicate if this item can be expanded
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
    FormData?: any; // Store the form data for this product/service
    FormType?: string; // Type of form (e.g., 'llc-formation2')
    FormTitle?: string; // Friendly display title for the form
    FormSummary?: string; // Summary of key form data for display
    IsExpandable?: boolean; // Flag to indicate if this item can be expanded
    CartItemId?: string; // Unique identifier for this cart item
    AddedToCart?: Date; // When this item was added to cart
    OrderId?: string; // Reference to the order this cart item represents
}

export interface Cart {
    CustomerId: string;
    Items: CartItem[];
    TotalAmount: number;
    ItemCount: number;
    SessionId?: string;
    Created?: Date;
    Updated?: Date;
    CreatedBy?: string;
    UpdatedBy?: string;
}