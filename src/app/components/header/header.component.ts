import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { NgIf, AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';


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

  public constructor() {


  }
  public logout() {
    this.auth.logout();
  }
  public toggleUser() {
    /*
    if(this.authService.currentUser?.username =='bmessegee'){
      this.authService.login(this.authService.testUser1);
    }else{
      this.authService.login(this.authService.testUser);
    }
      */
  }
  public home() {
    if (this.auth.isCustomerUser()) {
      this.router.navigate(["./customer/dashboard"]);
    } else {
      this.router.navigate(["./tenant/dashboard"]);
    }

  }
}
