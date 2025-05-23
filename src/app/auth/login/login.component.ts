import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }                from '@angular/common';
import { Router }                      from '@angular/router';
import { AuthService }                 from '../../services/auth.service';
import { Observable }                  from 'rxjs';
import { UserDataResult }              from 'angular-auth-oidc-client';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public auth   = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // redirect to dashboard as soon as we see a login
    this.auth.user$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/customer/dashboard']);
      }
    });
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }
}