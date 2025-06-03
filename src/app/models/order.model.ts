export interface Order {
    OrderId: string;
    CustomerId: string;
    TenantId: string;
    CustomerName: string;
    OrderName: string;
    Price: string;
    Comments: string;
    Details: OrderDetails;
    Created: Date;
    Updated: Date;
    CreatedBy: string;
    UpdatedBy: string;
}
export interface OrderDetails{
    // TODO
}