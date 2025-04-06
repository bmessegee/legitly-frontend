import { Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { DocumentsComponent } from './documents/documents.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { ProductsComponent } from './products/products.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
    { path: 'dashboard', component: UserDashboardComponent },
    { path: 'documents', component: DocumentsComponent },
    { path: 'form-builder', component: FormBuilderComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'admin', component: AdminDashboardComponent },
];
