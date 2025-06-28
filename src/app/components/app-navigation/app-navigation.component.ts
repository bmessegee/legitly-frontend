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
  constructor(private router: Router, public authService: AuthService) { }

  ngAfterViewInit() {

    // Only react when user is non-null

    this.auth.user$
      .pipe(filter(u => !!u))
      .subscribe(user => {
        window.setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 200)
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
}
