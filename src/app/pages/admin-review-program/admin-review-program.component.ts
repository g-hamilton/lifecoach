import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';
import { AdminProgramReviewRequest } from 'app/interfaces/admin.program.review.interface';
import { AlertService } from 'app/services/alert.service';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { AuthService } from 'app/services/auth.service';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-admin-review-program',
  templateUrl: './admin-review-program.component.html',
  styleUrls: ['./admin-review-program.component.scss']
})
export class AdminReviewProgramComponent implements OnInit, OnDestroy {

  public browser: boolean;
  public userId: string; // admin's uid
  private programId: string;
  public program: CoachingProgram;
  public reviewRequest: AdminProgramReviewRequest;
  public uploadedImage: string; // will be a base64 string
  public rejectForm: FormGroup;
  public focus: boolean;
  public focusTouched: boolean;
  public approving: boolean;
  public rejecting: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    public formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private alertService: AlertService,
    private authService: AuthService,
    private cloudFunctionsService: CloudFunctionsService,
    private analyticsService: AnalyticsService,
    private storageService: StorageService,
    private cloudFunctions: CloudFunctionsService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.getRouteData();
      this.getUserData();
      this.buildRejectForm();
    }
  }

  buildRejectForm() {
    this.rejectForm = this.formBuilder.group({
      reason: ['', [Validators.required]]
    });
  }

  get rejectF(): any {
    return this.rejectForm.controls;
  }

  getRouteData() {
    this.route.params.subscribe(params => {
      if (params.programId) {
        this.programId = params.programId;
        this.loadReviewRequest();
      }
    });
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;
        }
      })
    );
  }

  loadReviewRequest() {
    this.subscriptions.add(
      this.dataService.getProgramReviewRequest(this.programId).subscribe(data => {
        if (data) {
          this.reviewRequest = data;
          if (this.reviewRequest.sellerUid) {
            this.loadProgram();
          } else {
            this.alertService.alert('warning-message', 'No seller UID - cannot load program!');
          }
        }
      })
    );
  }

  loadProgram() {
    this.subscriptions.add(
      this.dataService.getPrivateProgram(this.reviewRequest.sellerUid, this.programId).subscribe(data => {
        if (data) {
          this.program = data;
          // console.log('program loaded:', this.program);
        }
      })
    );
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    return `${day} ${date.toLocaleDateString()}`;
  }

  async onImageUpload($event: any) {
    /*
      Triggered by the 'messageEvent' listener on the component template.
      The child 'picture-upload-component' will emit a chosen image as
      a base64 string when an image is chosen. We'll listen for that change
      here and grab the string for saving to storage & patching into the program.
    */
    // console.log(`received base64 image string: ${$event}`);
    this.uploadedImage = $event;
    if (!this.uploadedImage) {
      return;
    }

    // auto save any new image to storage

    // old version
    // const url = await this.storageService.storeProgramImageUpdateDownloadUrl(this.program.sellerUid, this.uploadedImage);
    // this.program.image = url; // assigns a storage downloadURL string

    // new version (optimized)
    const response = await this.cloudFunctions
      .uploadProgramImage({uid: this.program.sellerUid, img: this.uploadedImage})
      .catch(e => console.log(e));

    // @ts-ignore
    const url = await response.original.fullSize || '';
    this.program.image = url;
    // @ts-ignore
    this.program.imagePaths = await response;

    // auto save the program now that it has a new image
    this.dataService.savePrivateProgram(this.program.sellerUid, this.program);
  }

  async approveProgram() {
    this.approving = true;

    // safety checks
    if (!this.reviewRequest) {
      this.alertService.alert('warning-message', 'Oops', 'Missing review request. Unable to approve program.');
      this.approving = false;
      return;
    }
    if (!this.programId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing program ID. Unable to approve program.');
      this.approving = false;
      return;
    }
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing admin user ID. Unable to approve program.');
      this.approving = false;
      return;
    }

    // attempt approval
    const res = await this.alertService.alert('warning-message-and-confirmation', 'Confirm', 'Are you sure you want to approve this program?', 'Yes - Approve', 'Cancel') as any;
    if (res && res.action) { // user confirms
      console.log('Sending program review approval:', this.programId, this.userId, this.reviewRequest);
      const response = await this.cloudFunctionsService.adminApproveProgramReview(this.programId, this.userId, this.reviewRequest) as any;
      if (response.error) { // error
        this.alertService.alert('warning-message', 'Oops', JSON.stringify(response));
        this.approving = false;
        return;
      }
      // success
      this.analyticsService.adminApproveProgram(this.programId);
      await this.alertService.alert('success-message', 'Success!', 'Program Approved.');
      this.router.navigate(['/admin-program-review']);
    }
    this.approving = false;
  }

  async rejectProgram() {
    this.rejecting = true;

    // safety checks
    if (!this.programId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing program ID. Unable to reject program.');
      this.rejecting = false;
      return;
    }
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing user ID. Unable to approve program.');
      this.rejecting = false;
      return;
    }
    if (this.rejectForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Invalid form data.');
      this.rejecting = false;
      return;
    }
    if (!this.reviewRequest) {
      this.alertService.alert('warning-message', 'Oops', 'Missing review request data.');
      this.rejecting = false;
      return;
    }

    // update the review request object with reject data
    this.reviewRequest.rejectData = this.rejectForm.value;

    // attemp rejection
    const response = await this.cloudFunctionsService.adminRejectProgramReview(this.programId, this.userId, this.reviewRequest) as any;
    if (response.error) { // error
      this.alertService.alert('warning-message', 'Oops', JSON.stringify(response));
      this.rejecting = false;
      return;
    }
    // success
    this.rejecting = false;
    this.analyticsService.adminRejectProgram(this.programId);
    await this.alertService.alert('success-message', 'Success!', 'Program rejected. Feedback sent to program creator.');
    this.router.navigate(['/admin-program-review']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
