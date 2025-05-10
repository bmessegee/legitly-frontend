// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router }     from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';   // <-- your existing model

@Injectable({ providedIn: 'root' })
export class AuthService {
 
  private _isAuth$ = new BehaviorSubject<boolean>(false);
  private _user$   = new BehaviorSubject<User | null>(null);

  /** Streams for components to consume */
  isAuthenticated$: Observable<boolean> = this._isAuth$.asObservable();
  user$:            Observable<User | null> = this._user$.asObservable();
  currentUser?:User | null;

  /** OIDC configuration (if you need it elsewhere) */
  //configuration$ = this.oidc.getConfiguration();

  constructor(
    private oidc:   OidcSecurityService,
    private router: Router
  ) {
    // Keep the boolean auth flag up-to-date
    this.oidc.isAuthenticated$
      .pipe(map(r => r.isAuthenticated))
      .subscribe(isAuth => {
        this._isAuth$.next(isAuth);
        if (!isAuth) {
          // clear user model when logged out
          this._user$.next(null);
        }
      });

    // Map raw userData into your User model, pulling out groups
    this.oidc.userData$.subscribe(raw => {
      if (raw) {
        const groupsClaim = raw.userData['cognito:groups'] ?? raw.userData['groups'] ?? [];
        const groups = Array.isArray(groupsClaim) ? groupsClaim : [groupsClaim];

        const user: User = {
          sub: raw.userData.sub,
          email: raw.userData.email,
          phoneNumber: raw.userData.phone_number ?? raw.userData.phoneNumber,
          givenName: raw.userData.given_name ?? raw.userData.givenName,
          familyName: raw.userData.family_name ?? raw.userData.familyName,
          //groups,
          // ...and spread any other claim you need
          //...raw
        };

        this._user$.next(user);
      } else {
        this._user$.next(null);
      }

      this._user$.subscribe(user =>{
        this.currentUser = user;
      } );
    });

    // Trigger an initial check to bootstrap state
    this.oidc.checkAuth().subscribe();
  }

  /** Starts the Cognito login flow */
  login(): void {
    this.oidc.authorize();
  }

  /** Clears state and redirects to Cognito logout */
  logout(): void {
    this._isAuth$.next(false);
    this._user$.next(null);
    this.oidc.logoff();
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }

    /*
    window.location.href =
      `https://legitly-dev.auth.us-east-1.amazoncognito.com/logout`
      + `?client_id=7j16s1gd4rt6hpqa8op5098r2e`
      + `&logout_uri=${encodeURIComponent(window.location.origin)}`;
      */
  }
  isAuthenticated():boolean{
    return this.currentUser != null;
  }
  isTenantUser() : boolean{
    return false;
  }
  isCustomerUser() : boolean{
    return true;
  }
  isTenantAdmin() : boolean{
    return false
  }
}