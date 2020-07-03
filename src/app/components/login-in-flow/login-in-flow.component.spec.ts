import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginInFlowComponent } from './login-in-flow.component';

describe('LoginInFlowComponent', () => {
  let component: LoginInFlowComponent;
  let fixture: ComponentFixture<LoginInFlowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginInFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginInFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
