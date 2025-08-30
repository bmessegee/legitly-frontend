import { Component, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { DASHBOARD_CARDS, DashboardCard } from '../../../models/dashboard-card.model';
import { AuthService } from '../../../services/auth.service';
import { ProductForm } from '../../../models/product-form';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgFor,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
]
})
export class UserDashboardComponent {
  private breakpointObserver = inject(BreakpointObserver);
  public authService = inject(AuthService);

  //dashboardCards = dashboardCards;
  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        // Mobile: single column layout
        DASHBOARD_CARDS.forEach(element => {
          element.cols = 3; // Full width on mobile (3 out of 3 columns)
          element.rows = 1;
        });
        return DASHBOARD_CARDS;

      }
      DASHBOARD_CARDS.forEach(element => {
        element.cols = 1;
        element.rows = 1;
        // LLC packages should be 3-wide on desktop, tenant cards 2-wide
        if(element.id == 'llc-essentials' || element.id == 'llc-complete' || element.id == 'llc-executive') { 
          element.cols = 1; // 3 cards at 1 col each = 3-wide
        } else if(element.id == 'customers' || element.id == 'tenant-messages-inbox') { 
          element.cols = 2; // Tenant cards remain 2-wide
        }
      });
      return DASHBOARD_CARDS;
    
    })
  );

  constructor(private router: Router) {}

  routeTo(input: string, query: string){
    this.router.navigate([input], {queryParams: {query}});
  }

  // Check if card is an LLC package
  isLLCPackage(cardId: string): boolean {
    return ['llc-essentials', 'llc-complete', 'llc-executive'].includes(cardId);
  }

  // Get package subtitle from product form
  getPackageSubtitle(cardId: string): string {
    const productForm = new ProductForm();
    const packageConfig: any = productForm.getForm(cardId);
    return packageConfig?.subtitle || '';
  }

  // Get package features for preview
  getPackageFeatures(cardId: string): string[] {
    const productForm = new ProductForm();
    const packageConfig: any = productForm.getForm(cardId);
    return packageConfig?.features || [];
  }
}