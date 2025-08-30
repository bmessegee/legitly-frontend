import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlPreservationService {
  private storageKey = 'intended_url';

  constructor() { }

  /**
   * Store the intended URL for later use
   */
  setIntendedUrl(url: string): void {
    console.log('Storing intended URL:', url);
    sessionStorage.setItem(this.storageKey, url);
  }

  /**
   * Get and clear the intended URL
   */
  getAndClearIntendedUrl(): string | null {
    const url = sessionStorage.getItem(this.storageKey);
    if (url) {
      sessionStorage.removeItem(this.storageKey);
      console.log('Retrieved and cleared intended URL:', url);
      return url;
    }
    console.log('No intended URL found');
    return null;
  }

  /**
   * Check if URL is a valid route we want to preserve
   */
  isValidIntendedUrl(url: string): boolean {
    if (!url || url === '/' || url === '') {
      return false;
    }

    const validPrefixes = [
      '/customer/product',
      '/messages',
      '/orders',
      '/cart',
      '/checkout',
      '/customer/documents'
    ];

    return validPrefixes.some(prefix => url.startsWith(prefix));
  }
}