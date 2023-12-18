import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideNavButtonComponent } from './side-nav-button.component';

describe('SideNavButtonComponent', () => {
  let component: SideNavButtonComponent;
  let fixture: ComponentFixture<SideNavButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideNavButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SideNavButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
