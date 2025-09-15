import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth-guard';
import { LoginComponent } from './auth/login/login.component';
import { UserDashboardComponent } from './components/common/user-dashboard/user-dashboard.component';
import { DocumentsComponent } from './components/common/documents/documents.component';
import { FormBuilderComponent } from './components/tenant/form-builder/form-builder.component';
import { MessagesComponent } from './components/common/messages/messages.component';
import { ProductComponent } from './components/customer/product/product.component';
import { OrdersComponent } from './components/common/orders/orders.component';
import { CustomersComponent } from './components/tenant/customers/customers.component';
import { MessagesInboxComponent } from './components/tenant/messages-inbox/messages-inbox.component';
import { TenantOrdersComponent } from './components/tenant/orders/tenant-orders.component';
import { CartComponent } from './components/common/cart/cart.component';
import { CheckoutComponent } from './components/customer/checkout/checkout.component';
import { CheckoutSuccessComponent } from './components/customer/checkout/success/checkout-success.component';
import { CheckoutCancelComponent } from './components/customer/checkout/cancel/checkout-cancel.component';
import { StripeSuccessComponent } from './components/stripe/stripe-success/stripe-success.component';
import { StripeCancelComponent } from './components/stripe/stripe-cancel/stripe-cancel.component';


export const routes: Routes = [
    // public login
    { path: 'login', component: LoginComponent },
    {
        path: 'dashboard', component: UserDashboardComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer', 'Tenant'] }
    },
    {
        path: 'customer/documents', component: DocumentsComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer','Tenant'] }
    },
    {
        path: 'messages', component: MessagesComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer','Tenant'] }
    },
    {
        path: 'orders', component: OrdersComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer','Tenant'] }
    },
    {
        path: 'cart', component: CartComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'checkout/success', component: CheckoutSuccessComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'checkout/cancel', component: CheckoutCancelComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'customer/product', component: ProductComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'tenant/customers', component: CustomersComponent, canActivate: [AuthGuard],
        data: { roles: ['Tenant', 'Admin'] }
    },
    {
        path: 'tenant/messages-inbox', component: MessagesInboxComponent, canActivate: [AuthGuard],
        data: { roles: ['Tenant', 'Admin'] }
    },
    {
        path: 'tenant/orders', component: TenantOrdersComponent, canActivate: [AuthGuard],
        data: { roles: ['Tenant', 'Admin'] }
    },
    {
        path: 'tenant/form-builder', component: FormBuilderComponent, canActivate: [AuthGuard],
        data: { roles: ['Admin'] }
    },
    
    // Stripe payment result pages
    {
        path: 'success', component: StripeSuccessComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'cancel', component: StripeCancelComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },

    // fallback
    /*
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' },
     */
];
