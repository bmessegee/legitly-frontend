import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NgIf, AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-header',
  imports: [
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatButtonModule,
    NgIf, AsyncPipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public auth = inject(AuthService);
  public router = inject(Router);
  public cartService = inject(CartService);
  public cartCount$: Observable<number>;

  public constructor() {
    this.cartCount$ = this.cartService.cartCount$;
  }

  public logout() {
    this.auth.logout();
  }
  public login() {
    this.auth.login();
  }
  public home() {
      this.router.navigate(["./dashboard"]);

  }
  public help(){
    // TODO
  }
  public profile(){
    // TODO
  }
  public settings(){
    // TODO
  }
  
  public goToCart() {
    this.router.navigate(['/cart']);
  }
}
