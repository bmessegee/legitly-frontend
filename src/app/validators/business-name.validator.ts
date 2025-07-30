import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError, finalize, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ApiService } from '../services/api.service';

export function businessNameValidator(): AsyncValidatorFn {
  const apiService = inject(ApiService);
  
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.trim().length === 0) {
      return of(null);
    }

    const businessName = control.value.trim();
    
    // Check basic LLC name requirements first
    if (!isValidLLCName(businessName)) {
      return of({ 
        invalidLLCName: { 
          value: businessName,
          message: 'LLC name must contain "Limited Liability Company", "Limited Liability Co.", "L.L.C.", or "LLC"'
        } 
      });
    }
    
    // Debounce the API call by 800ms to avoid too many requests
    return timer(800).pipe(
      switchMap(() => apiService.get<{isAvailable: boolean}>(`business-name/check?name=${encodeURIComponent(businessName)}`)),
      map(response => {
        if (response.isAvailable) {
          return null; // Name is available
        } else {
          return { 
            businessNameTaken: { 
              value: businessName,
              message: 'This business name is already registered in Washington State. Please choose a different name.'
            } 
          };
        }
      }),
      catchError((error) => {
        console.error('Business name validation error:', error);
        // Return validation error for API failures so user knows to try again
        return of({ 
          businessNameCheckFailed: { 
            value: businessName,
            message: 'Unable to verify name availability. Please check your connection and try again.'
          } 
        });
      })
    );
  };
}

function isValidLLCName(name: string): boolean {
  const llcPatterns = [
    /limited liability company/i,
    /limited liability co\./i,
    /l\.l\.c\./i,
    /\bllc\b/i
  ];
  
  return llcPatterns.some(pattern => pattern.test(name));
}

