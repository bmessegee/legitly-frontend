import { Component, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { DASHBOARD_CARDS, DashboardCard } from '../../../models/dashboard-card.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    NgIf
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
        DASHBOARD_CARDS.forEach(element => {
          element.cols = 2;
          element.rows = 1;
        });
        return DASHBOARD_CARDS;

      }
      DASHBOARD_CARDS.forEach(element => {
        element.cols = 1;
        element.rows = 1;
        if(element.id == 'llc-formation' || element.id == 'legal-services' || element.id == 'customers') { element.cols = 2;}
      });
      return DASHBOARD_CARDS;
    
    })
  );

  constructor(private router: Router) {}

  routeTo(input: string, query: string){
    this.router.navigate([input], {queryParams: {query}});
  }
}