import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUserButtonsComponent } from './new-user-buttons.component';

describe('NewUserButtonsComponent', () => {
  let component: NewUserButtonsComponent;
  let fixture: ComponentFixture<NewUserButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewUserButtonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUserButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
