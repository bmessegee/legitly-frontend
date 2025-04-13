import { Component, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { DashboardCard } from '../../../models/dashboard-card.model';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
  standalone: true,
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
]
})
export class UserDashboardComponent {
  private breakpointObserver = inject(BreakpointObserver);

  //dashboardCards = dashboardCards;
  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        dashboardCards.forEach(element => {
          element.cols = 2;
          element.rows = 1;
        });
        return dashboardCards;
        /*
        return [
          { title: 'LLC Formation', cols: 2, rows: 1, icon:'domain_add', description:'Quickly provide basic information and we will form your LLC for you!', link:'/product', query:'123' },
          { title: 'Card 2', cols: 2, rows: 1 },
          { title: 'Card 3', cols: 2, rows: 1 },
          { title: 'Card 4', cols: 2, rows: 1 }
        ];
        */
      }
      dashboardCards.forEach(element => {
        element.cols = 1;
        element.rows = 1;
        if(element.id == 'llc-formation' || element.id == 'legal-services'){ element.cols = 2;}
        if(element.id == 'messages'){ element.rows = 2;}
      });
      return dashboardCards;
      /*
      return [
        { title: 'LLC Formation', cols: 2, rows: 1, icon:'domain_add', description:'Quickly provide basic information and we will form your LLC for you!', link:'/product', query:'123' },
        { title: 'Orders', cols: 1, rows: 1 },
        { title: 'Messages', cols: 1, rows: 2 },
        { title: 'Documents', cols: 1, rows: 1 }
      ];
      */
    })
  );

  constructor(private router: Router) {}

  routeTo(input: string, query: string){
    this.router.navigate([input], {queryParams: {query}});
  }
}

export const dashboardCards: DashboardCard[] = [
  {
    id: 'llc-formation',
    cols: 2,
    rows: 1,
    title: 'LLC Formation',              // You might change these numbers to strings if necessary.
    description: 'Quickly provide basic information and we will form your LLC for you!',        // For example: "LLC Formation Product"
    icon: 'domain',        // Angular Material icon for business-related products.
    displayRoles: ['customer'],
    actionDisplay: 'Get Started',
    actionLink: '/customer/product',
    actionQuery: 'llc-formation'
  },
  {
    id: 'legal-services',
    cols: 2,
    rows: 1,
    title: 'Legal Consulting Subscription',
    description: 'Legal help from real attorneys for all your business needs!',
    icon: 'gavel',
    displayRoles: ['customer'],
    actionDisplay: 'Learn More',
    actionLink: '/customer/services',
    actionQuery: 'service=legal-subscription'
  },
  {
    id: 'messages',
    cols: 1,
    rows: 2,
    title: 'Messages',
    description: 'Send, receive, and view messages',
    icon: 'message',
    displayRoles: ['tenant', 'customer'],
    actionDisplay: 'View Messages',
    actionLink: '/messages',
    actionQuery: 'ref=dashboard'
  },
  {
    id: 'orders',
    cols: 1,
    rows: 1,
    title: 'Orders',
    description: 'View past and pending orders',
    icon: 'shopping_cart',
    displayRoles: ['customer'],
    actionDisplay: 'View Orders',
    actionLink: '/customer/orders',
    actionQuery: 'ref=dashboard'
  },
  {
    id: 'documents',
    cols: 1,
    rows: 1,
    title: 'Documents',
    description: 'View all your documents here',
    icon: 'folder',
    displayRoles: ['customer'],
    actionDisplay: 'View Documents',
    actionLink: '/customer/documents',
    actionQuery: 'ref=dashboard'
  }
];