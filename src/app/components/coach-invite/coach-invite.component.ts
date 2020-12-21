import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthService } from 'app/services/auth.service';
import { DataService } from 'app/services/data.service';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { CRMPerson } from 'app/interfaces/crm.person.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/*
  This component is designed to be a re-usable modal.
  Coaches can invite people to sign up for their products and services.
*/

@Component({
  selector: 'app-coach-invite',
  templateUrl: './coach-invite.component.html',
  styleUrls: ['./coach-invite.component.scss']
})
export class CoachInviteComponent implements OnInit {

  // modal config
  public type: 'ecourse' | 'program';
  public invitee: CRMPerson;

  // component
  public browser: boolean;
  private userId: string;
  public publishedPrograms: CoachingProgram[]; // programs created as coach
  public publishedCourses: CoachingCourse[]; // ecourses created as coach
  private subscriptions: Subscription = new Subscription();
  public saving = false;
  public saveAttempt = false;
  public inviteForm: FormGroup;
  public focus: boolean;
  public focusTouched: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    public bsModalRef: BsModalRef,
    private authService: AuthService,
    private dataService: DataService,
    public formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildForm();
      this.getUserData();
    }
  }

  buildForm() {
    if (this.type === 'program') {
      this.inviteForm = this.formBuilder.group({
        program: [null, Validators.required]
      });
    } else if (this.type === 'ecourse') {
      this.inviteForm = this.formBuilder.group({
        course: [null, Validators.required]
      });
    }
  }

  get inviteF(): any {
    return this.inviteForm.controls;
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;
          // check for this user's products & services so we can auto populate drop-down selectors
          if (this.type === 'program') {
            this.getUserPrograms();
          } else if (this.type === 'ecourse') {
            this.getUserCourses();
          }
        }
      })
    );
  }

  getUserPrograms() {
    this.subscriptions.add(
      this.dataService.getPrivatePrograms(this.userId).subscribe(programs => {
        if (programs) {
          this.publishedPrograms = programs;
          console.log('Published Programs:', programs);
        }
      })
    );
  }

  getUserCourses() {
    this.subscriptions.add(
      this.dataService.getPrivateCourses(this.userId).subscribe(courses => {
        if (courses) {
          this.publishedCourses = courses;
          console.log('Published Courses:', courses);
        }
      })
    );
  }

}
