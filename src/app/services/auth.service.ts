// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';   // <-- your existing model
import { Customer } from '../models/customer.model';
import { UrlPreservationService } from './url-preservation.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _isAuth$ = new BehaviorSubject<boolean>(false);
  private _user$ = new BehaviorSubject<User | null>(null);
  
  /** Streams for components to consume */
  isAuthenticated$: Observable<boolean> = this._isAuth$.asObservable();
  user$: Observable<User | null> = this._user$.asObservable();

  currentUser?: User | null;
  bearerToken?: string | null;

  /** OIDC configuration (if you need it elsewhere) */
  //configuration$ = this.oidc.getConfiguration();

  constructor(
    private oidc: OidcSecurityService,
    private router: Router,
    private urlPreservation: UrlPreservationService
  ) {

    // Map raw userData into your User model, pulling out groups
    this.oidc.userData$.subscribe(raw => {
      if (raw && raw.userData) {
        const groupsClaim = raw.userData['cognito:groups'] ?? raw.userData['groups'] ?? [];
        const groups = Array.isArray(groupsClaim) ? groupsClaim : [groupsClaim];

        const user: User = {
          sub: raw.userData.sub,
          userId: raw.userData.sub, // Map userId to sub for consistency
          email: raw.userData.email,
          phoneNumber: raw.userData.phone_number ?? raw.userData.phoneNumber,
          givenName: raw.userData.given_name ?? raw.userData.givenName,
          familyName: raw.userData.family_name ?? raw.userData.familyName,
          groups: groups,
          tenantId: raw.userData['custom:tenantId'] || raw.userData.tenantId || '',
          customerId: raw.userData['custom:customerId'] || raw.userData.customerId || ''
        };
        this._user$.next(user);
      } else {
        this._user$.next(null);
      }

      // This executed once upon login - trigger one-time setups
      this._user$.subscribe(user => {
        this.currentUser = user;
      });
    });

    // 3) Kick off initial checkAuth() and then immediately grab the token
    this.oidc.checkAuth()
      .pipe(
        // Once checkAuth() completes, switch to getAccessToken()
        switchMap(() => this.oidc.getAccessToken())
      )
      .subscribe(token => {
        // Only emits once checkAuth() has already loaded the token
        this.bearerToken = token;
        if(this.bearerToken){
          this._isAuth$.next(true);
          
          // Check for preserved URL after successful authentication
          this.handlePostAuthNavigation();
        }
      });
  }

  /** Handle navigation after successful authentication */
  private handlePostAuthNavigation(): void {
    // Small delay to ensure user context is fully loaded
    setTimeout(() => {
      const urlData = (this.urlPreservation as any).getAndClearIntendedUrlData();
      if (urlData) {
        console.log('Navigating to preserved URL with data:', urlData);
        
        // Navigate using the structured data
        if (Object.keys(urlData.queryParams).length > 0) {
          console.log('Navigating with path:', urlData.path, 'and params:', urlData.queryParams);
          this.router.navigate([urlData.path], { queryParams: urlData.queryParams });
        } else {
          console.log('Navigating to path:', urlData.path);
          this.router.navigate([urlData.path]);
        }
      } else {
        // Default navigation to dashboard
        console.log('No preserved URL, navigating to dashboard');
        this.router.navigate(['/dashboard']);
      }
    }, 100);
  }

  /** Starts the Cognito login flow */
  login(): void {
    this.oidc.authorize();
  }

  /** Clears state and redirects to Cognito logout */
  logout(): void {
    this._isAuth$.next(false);
    this._user$.next(null);
    //this.oidc.logoff().subscribe();
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }
    window.location.href = "https://legitly-dev.auth.us-east-1.amazoncognito.com/logout?client_id=5au1hi0fruvur8vpmpttiqlb15&logout_uri=http://localhost:4200/logout";
  }
  isAuthenticated(): boolean {
    return this.currentUser != null;
  }
  isTenantUser(): boolean {
    return this.checkGroupMember('Tenant');
  }
  isCustomerUser(): boolean {
    return this.checkGroupMember('Customer');
  }
  isTenantAdmin(): boolean {
    return this.checkGroupMember('Admin');
  }
  isInRole(groups: string[]) {
    return this.currentUser?.groups?.some(val => { return groups.some(g => { return g == val }) });
  }
  checkGroupMember(name: string): boolean {
    if (this.currentUser?.groups?.some(val => { return val == name })) {
      return true;
    }
    return false;
  }
}