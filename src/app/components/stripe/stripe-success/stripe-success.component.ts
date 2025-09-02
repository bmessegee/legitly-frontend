import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stripe-success',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './stripe-success.component.html',
  styleUrl: './stripe-success.component.scss'
})
export class StripeSuccessComponent {
  private router = inject(Router);

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
