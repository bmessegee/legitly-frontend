import { Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { DocumentsComponent } from './documents/documents.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { MessagesComponent } from './messages/messages.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProductComponent } from './product/product.component';
import { OrdersComponent } from './orders/orders.component';

export const routes: Routes = [
    { path: 'dashboard', component: UserDashboardComponent },
    { path: 'documents', component: DocumentsComponent },
    { path: 'form-builder', component: FormBuilderComponent },
    { path: 'messages', component: MessagesComponent },
    { path: 'admin', component: AdminDashboardComponent },
    { path: 'product', component: ProductComponent },
    { path: 'orders', component: OrdersComponent },
];
