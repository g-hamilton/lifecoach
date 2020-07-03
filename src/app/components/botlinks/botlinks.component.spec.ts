import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotlinksComponent } from './botlinks.component';

describe('BotlinksComponent', () => {
  let component: BotlinksComponent;
  let fixture: ComponentFixture<BotlinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotlinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotlinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
