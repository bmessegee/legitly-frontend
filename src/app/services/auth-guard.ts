import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Adjust the path as necessary

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // Check if the user is authenticated.
    if (!this.authService.isAuthenticated()) {
      // Redirect to the login page; include a return URL for redirection after successful login.
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
      return false;
    }

    // If the route defines required roles in its data (optional)
    const roles: string[] = route.data['roles'];
    if (roles && roles.length > 0) {
      const user = this.authService.currentUser;
      let userRoles: string[] = [];
      if (user) {
        // Combine available tenant and customer roles into one array.
        if (user.tenantRoles) {
          userRoles = userRoles.concat(user.tenantRoles);
        }
        if (user.customerRoles) {
          userRoles = userRoles.concat(user.customerRoles);
        }
      }
      // Check if the user has at least one of the required roles.
      if (!roles.some(role => userRoles.includes(role))) {
        // Redirect to an unauthorized page or display an access denied message.
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    // If authenticated and (if required) roles match, allow navigation.
    return true;
  }
}