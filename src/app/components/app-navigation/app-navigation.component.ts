import { AfterViewInit, Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { filter, map, shareReplay, take } from 'rxjs/operators';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DASHBOARD_CARDS, DashboardCard } from '../../models/dashboard-card.model';
import { CustomerService } from '../../services/customer.service';
import { UrlPreservationService } from '../../services/url-preservation.service';

@Component({
  selector: 'app-app-navigation',
  templateUrl: './app-navigation.component.html',
  styleUrl: './app-navigation.component.css',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    NgIf, NgFor,
    RouterOutlet
  ]
})
export class AppNavigationComponent implements AfterViewInit {
  private breakpointObserver = inject(BreakpointObserver);
  public auth = inject(AuthService);
  public cards: DashboardCard[] = DASHBOARD_CARDS;
  
  constructor(
    private router: Router, 
    public authService: AuthService, 
    private custService: CustomerService,
    private urlPreservation: UrlPreservationService
  ) { }

  ngAfterViewInit() {

    // This is the kickoff of the user interaction with the app
    this.auth.isAuthenticated$
      .pipe(filter(u => !!u))
      .subscribe(user => {
        this.doStartup();
      });
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  public routeTo(input: string): void {
    this.router.navigate([input]);
  }

  doStartup(): void {
    // Determine where to navigate after authentication
    const targetUrl = this.getTargetUrl();
    console.log('Navigating to target URL:', targetUrl);

    if (this.auth.isCustomerUser()) {
      this.custService.customer$.subscribe({
        next: cust => {
          this.router.navigate([targetUrl]);
        },
        error: err => {
          console.error(err);
          // Even on error, navigate somewhere so user isn't stuck
          this.router.navigate(['/dashboard']);
        }
      });
      // Load the customer object before proceeding
      this.custService.getCustomerForUser();
    }else{
      // For non-customers, don't load the customer object
      this.router.navigate([targetUrl]);
    }
  }

  private getTargetUrl(): string {
    // Check for stored intended URL first
    const intendedUrl = this.urlPreservation.getAndClearIntendedUrl();
    if (intendedUrl) {
      console.log('Using stored intended URL:', intendedUrl);
      return intendedUrl;
    }
    
    // Default to dashboard
    console.log('No intended URL found, defaulting to dashboard');
    return '/dashboard';
  }
}
