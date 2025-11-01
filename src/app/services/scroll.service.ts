import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private scrolledSubject = new BehaviorSubject<boolean>(false);
  public scrolled$ = this.scrolledSubject.asObservable();

  setScrolled(scrolled: boolean): void {
    this.scrolledSubject.next(scrolled);
  }
}
