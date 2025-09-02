import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeCancelComponent } from './stripe-cancel.component';

describe('StripeCancelComponent', () => {
  let component: StripeCancelComponent;
  let fixture: ComponentFixture<StripeCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StripeCancelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StripeCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
