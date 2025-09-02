import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf }                from '@angular/common';
import { Router }                      from '@angular/router';
import { AuthService }                 from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable }                  from 'rxjs';
import { UserDataResult }              from 'angular-auth-oidc-client';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public auth   = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }
}