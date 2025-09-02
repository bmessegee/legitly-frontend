import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stripe-cancel',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './stripe-cancel.component.html',
  styleUrl: './stripe-cancel.component.scss'
})
export class StripeCancelComponent {
  private router = inject(Router);

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
