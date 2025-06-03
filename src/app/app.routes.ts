import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth-guard';
import { LoginComponent } from './auth/login/login.component';
import { UserDashboardComponent } from './components/common/user-dashboard/user-dashboard.component';
import { DocumentsComponent } from './components/common/documents/documents.component';
import { FormBuilderComponent } from './components/tenant/form-builder/form-builder.component';
import { MessagesComponent } from './components/common/messages/messages.component';
import { AdminDashboardComponent } from './components/tenant/admin-dashboard/admin-dashboard.component';
import { ProductComponent } from './components/customer/product/product.component';
import { OrdersComponent } from './components/common/orders/orders.component';


export const routes: Routes = [
    // public login
    { path: 'login', component: LoginComponent },
    {
        path: 'customer/dashboard', component: UserDashboardComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'documents', component: DocumentsComponent, canActivate: [AuthGuard],
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
        path: 'customer/product', component: ProductComponent, canActivate: [AuthGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'tenant/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard],
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
