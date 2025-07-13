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
import { CartComponent } from './components/common/cart/cart.component';
import { CheckoutComponent } from './components/customer/checkout/checkout.component';


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
        path: 'tenant/form-builder', component: FormBuilderComponent, canActivate: [AuthGuard],
        data: { roles: ['Admin'] }
    },

    // fallback
    /*
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' },
     */
];
