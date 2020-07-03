import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatroomsComponent } from './chatrooms.component';

describe('ChatroomsComponent', () => {
  let component: ChatroomsComponent;
  let fixture: ComponentFixture<ChatroomsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatroomsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatroomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
