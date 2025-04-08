import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Holds the current user state.
  private currentUserSubject: BehaviorSubject<User | null>;
  // Exposes an observable of the current user state.
  public currentUser$: Observable<User | null>;

  constructor() {
    // Attempt to load user data from localStorage for persistence.
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Returns the current user object.
   */
  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Log in the user by setting the current user state.
   * In a real-world scenario, you would typically call an API to authenticate
   * and retrieve the user details (including a token) before calling this method.
   *
   * @param user - The authenticated user object.
   */
  login(user: User): void {
    // Persist user data in localStorage to maintain session on refresh.
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Update the BehaviorSubject to notify subscribers.
    this.currentUserSubject.next(user);
    console.log('User logged in:', user);
  }

  /**
   * Log out the user by clearing the current user state.
   */
  logout(): void {
    // Remove the user data from localStorage.
    localStorage.removeItem('currentUser');
    // Update the BehaviorSubject to notify subscribers of the logout.
    this.currentUserSubject.next(null);
    console.log('User logged out.');
  }

  /**
   * Checks if the user is currently authenticated.
   *
   * @returns True if a user is logged in; false otherwise.
   */
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // ===================================================
  // Tenant-Specific Authorization Checks
  // ===================================================

  /**
   * Check if the current user is associated with a tenant.
   */
  isTenantUser(): boolean {
    return !!this.currentUser?.tenantId;
  }

  /**
   * Determines if the current tenant user has an admin role.
   */
  isTenantAdmin(): boolean {
    return !!this.currentUser?.tenantRoles?.includes('admin');
  }

  /**
   * Determines if the current tenant user has a processor role.
   */
  isTenantProcessor(): boolean {
    return !!this.currentUser?.tenantRoles?.includes('processor');
  }

  // ===================================================
  // Customer-Specific Authorization Checks
  // ===================================================

  /**
   * Check if the current user is associated with a customer.
   */
  isCustomerUser(): boolean {
    return !!this.currentUser?.customerId;
  }

  /**
   * Determines if the current customer user has an admin role.
   */
  isCustomerSuper(): boolean {
    return !!this.currentUser?.customerRoles?.includes('super');
  }

  /**
   * Determines if the current customer user has a regular role.
   */
  isCustomerRegular(): boolean {
    return !!this.currentUser?.customerRoles?.includes('regular');
  }
  /**
   * Optional: Expose the current user observable for additional observability.
   *
   * @returns Observable for the current user state.
   */
  getUserObservable(): Observable<User | null> {
    return this.currentUser$;
  }
}