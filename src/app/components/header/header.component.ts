import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ScrollService } from '../../services/scroll.service';
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
export class HeaderComponent implements OnInit {
  public auth = inject(AuthService);
  public router = inject(Router);
  public cartService = inject(CartService);
  private scrollService = inject(ScrollService);
  public cartCount$: Observable<number>;
  public isScrolled = false;

  public constructor() {
    this.cartCount$ = this.cartService.cartCount$;
  }

  ngOnInit() {
    // Subscribe to scroll state from the scroll service
    this.scrollService.scrolled$.subscribe(scrolled => {
      this.isScrolled = scrolled;
    });
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
