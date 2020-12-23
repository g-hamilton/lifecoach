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
import { ToastService } from 'app/services/toast.service';
import { CoachInvite } from 'app/interfaces/coach.invite.interface';
import { AlertService } from 'app/services/alert.service';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';

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
    private toastService: ToastService,
    private alertService: AlertService,
    private cloudFunctionsService: CloudFunctionsService
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
        program: [null, Validators.required],
        message: [null]
      });
    } else if (this.type === 'ecourse') {
      this.inviteForm = this.formBuilder.group({
        course: [null, Validators.required],
        message: [null]
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
          // console.log('Published Programs:', programs);
        }
      })
    );
  }

  getUserCourses() {
    this.subscriptions.add(
      this.dataService.getPrivateCourses(this.userId).subscribe(courses => {
        if (courses) {
          this.publishedCourses = courses;
          // console.log('Published Courses:', courses);
        }
      })
    );
  }

  itemLookup(itemId: string, itemType: 'ecourse' | 'program') {
    // looks up & returns the full item object based on type and item id.
    if (itemType === 'ecourse') {
      const matchIndex = this.publishedCourses.findIndex(i => i.courseId === itemId);
      return this.publishedCourses[matchIndex];
    } else if (itemType === 'program') {
      const matchIndex = this.publishedPrograms.findIndex(i => i.programId === itemId);
      return this.publishedPrograms[matchIndex];
    }
  }

  async sendInvite() {
    this.saveAttempt = true;
    this.saving = true;

    // console.log('onsubmit:', this.inviteForm.value);

    if (this.inviteForm.invalid) {
      this.saving = false;
      this.toastService.showToast('Please complete all required fields', 3000, 'danger', 'top', 'right');
      return;
    }

    const formData = this.inviteForm.value;

    let itemId: string;
    if (this.type === 'program') {
      itemId = formData.program;
    } else if (this.type === 'ecourse') {
      itemId = formData.course;
    }

    if (!itemId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing item ID. Please contact hello@lifecoach.io for support');
      this.saving = false;
      return;
    }

    const data: CoachInvite = {
      invitee: this.invitee,
      type: this.type,
      item: this.itemLookup(itemId, this.type),
      message: formData.message
    };

    // console.log(data);

    const res = await this.cloudFunctionsService.sendCoachInvite(data) as any;
    if (res.success) {
      this.alertService.alert('success-message', 'Success!', `Your invite is on it's way.`);
      this.bsModalRef.hide();
      this.saving = false;
      this.saveAttempt = false;
    } else if (res.error) {
      this.alertService.alert('warning-message', 'Oops!', res.error);
      this.saving = false;
      this.saveAttempt = false;
    }
  }

}
