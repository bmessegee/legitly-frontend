import { Injectable } from '@angular/core';

interface StoredUrlData {
  path: string;
  queryParams: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class UrlPreservationService {
  private storageKey = 'intended_url_data';

  constructor() { }

  /**
   * Store the intended URL for later use
   */
  setIntendedUrl(url: string): void {
    console.log('Storing intended URL:', url);
    
    // Parse URL into path and query parameters
    const [path, queryString] = url.split('?');
    const queryParams: { [key: string]: string } = {};
    
    if (queryString) {
      const pairs = queryString.split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        queryParams[key] = value || '';
      });
    }
    
    const urlData: StoredUrlData = { path, queryParams };
    console.log('Storing URL data:', urlData);
    sessionStorage.setItem(this.storageKey, JSON.stringify(urlData));
  }

  /**
   * Get and clear the intended URL data
   */
  getAndClearIntendedUrlData(): StoredUrlData | null {
    const urlDataString = sessionStorage.getItem(this.storageKey);
    if (urlDataString) {
      sessionStorage.removeItem(this.storageKey);
      const urlData: StoredUrlData = JSON.parse(urlDataString);
      console.log('Retrieved and cleared URL data:', urlData);
      return urlData;
    }
    console.log('No intended URL data found');
    return null;
  }

  /**
   * Get and clear the intended URL (legacy method for backward compatibility)
   */
  getAndClearIntendedUrl(): string | null {
    const urlData = this.getAndClearIntendedUrlData();
    if (urlData) {
      const queryString = Object.keys(urlData.queryParams).length > 0 
        ? '?' + Object.entries(urlData.queryParams).map(([key, value]) => `${key}=${value}`).join('&')
        : '';
      return urlData.path + queryString;
    }
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
      '/customer/documents',
      '/dashboard',
      '/tenant/customers',
      '/tenant/messages-inbox',
      '/tenant/form-builder'
    ];

    return validPrefixes.some(prefix => url.startsWith(prefix));
  }

  /**
   * Store URL immediately when app starts if accessing protected route
   */
  storeInitialUrl(): void {
    const currentUrl = window.location.pathname + window.location.search;
    console.log('Checking initial URL:', currentUrl);
    if (this.isValidIntendedUrl(currentUrl)) {
      this.setIntendedUrl(currentUrl);
    }
  }
}