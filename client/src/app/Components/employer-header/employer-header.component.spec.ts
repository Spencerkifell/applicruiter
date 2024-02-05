import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerHeaderComponent } from './employer-header.component';

describe('EmployerHeaderComponent', () => {
  let component: EmployerHeaderComponent;
  let fixture: ComponentFixture<EmployerHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployerHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployerHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
