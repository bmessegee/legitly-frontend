import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth-guard';
import { LoginComponent } from './auth/login/login.component';
import { UserDashboardComponent } from './components/customer/user-dashboard/user-dashboard.component';
import { DocumentsComponent } from './components/customer/documents/documents.component';
import { FormBuilderComponent } from './components/tenant/form-builder/form-builder.component';
import { MessagesComponent } from './components/messages/messages.component';
import { AdminDashboardComponent } from './components/tenant/admin-dashboard/admin-dashboard.component';
import { ProductComponent } from './components/customer/product/product.component';
import { OrdersComponent } from './components/customer/orders/orders.component';
import { TenantOrdersComponent } from './components/tenant/tenant-orders/tenant-orders.component';


export const routes: Routes = [
    // public login
    { path: 'login', component: LoginComponent },
    { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
    {
        path: 'customer/dashboard', component: UserDashboardComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'customer/documents', component: DocumentsComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'customer/product', component: ProductComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'customer/orders', component: OrdersComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'tenant/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Tenant'] }
    },
    {
        path: 'tenant/orders', component: TenantOrdersComponent, canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Tenant'] }
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
