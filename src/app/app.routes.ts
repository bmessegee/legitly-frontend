import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth-guard';
import { UserDashboardComponent } from './components/customer/user-dashboard/user-dashboard.component';
import { DocumentsComponent } from './components/customer/documents/documents.component';
import { FormBuilderComponent } from './components/tenant/form-builder/form-builder.component';
import { MessagesComponent } from './components/messages/messages.component';
import { AdminDashboardComponent } from './components/tenant/admin-dashboard/admin-dashboard.component';
import { ProductComponent } from './components/customer/product/product.component';
import { OrdersComponent } from './components/customer/orders/orders.component';

export const routes: Routes = [
    { path: 'dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },
    { path: 'documents', component: DocumentsComponent },
    { path: 'form-builder', component: FormBuilderComponent },
    { path: 'messages', component: MessagesComponent },
    { path: 'admin', component: AdminDashboardComponent },
    { path: 'product', component: ProductComponent },
    { path: 'orders', component: OrdersComponent },
];
