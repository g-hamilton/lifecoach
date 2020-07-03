import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseBotlinksComponent } from './course-botlinks.component';

describe('CourseBotlinksComponent', () => {
  let component: CourseBotlinksComponent;
  let fixture: ComponentFixture<CourseBotlinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseBotlinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseBotlinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
