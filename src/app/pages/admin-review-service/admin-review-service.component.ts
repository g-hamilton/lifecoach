import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';
import { AdminServiceReviewRequest } from 'app/interfaces/admin.service.review.interface';
import { AlertService } from 'app/services/alert.service';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { AuthService } from 'app/services/auth.service';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-admin-review-service',
  templateUrl: './admin-review-service.component.html',
  styleUrls: ['./admin-review-service.component.scss']
})
export class AdminReviewServiceComponent implements OnInit, OnDestroy {

  public browser: boolean;
  public userId: string; // admin's uid
  private serviceId: string;
  public service: CoachingService;
  public reviewRequest: AdminServiceReviewRequest;
  public uploadedImage: string; // will be a base64 string
  public rejectForm: FormGroup;
  public focus: boolean;
  public focusTouched: boolean;
  public approving: boolean;
  public rejecting: boolean;
  private subscriptions: Subscription = new Subscription();
  public objKeys = Object.keys;

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
      if (params.serviceId) {
        this.serviceId = params.serviceId;
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
      this.dataService.getServiceReviewRequest(this.serviceId).subscribe(data => {
        if (data) {
          this.reviewRequest = data;
          if (this.reviewRequest.sellerUid) {
            this.loadService();
          } else {
            this.alertService.alert('warning-message', 'No seller UID - cannot load service!');
          }
        }
      })
    );
  }

  loadService() {
    this.subscriptions.add(
      this.dataService.getPrivateService(this.reviewRequest.sellerUid, this.serviceId).subscribe(data => {
        if (data) {
          this.service = data;
          // console.log('service loaded:', this.service);
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

  calcDiscount(pricingObjKey: string) {
    // check that prices exist on the db object
    if (!this.service.pricing) {
      return 0;
    }
    if (!this.service.pricing['1'].price) {
      return 0;
    }
    if (!this.service.pricing[pricingObjKey].price) {
      return 0;
    }
    // convert the db prices into local prices
    const singleSessionPrice = this.service.pricing['1'].price;
    const packageTotalPrice = this.service.pricing[pricingObjKey].price;
    const packagePricePerSession = packageTotalPrice / Number(pricingObjKey);
    // don't apply a discount if the package price per session is more than or equal to the single session price
    if (singleSessionPrice <= packagePricePerSession) {
      return 0;
    }
    // it's discount time!
    return (100 - ((packagePricePerSession  / singleSessionPrice) * 100)).toFixed();
  }

  async onImageUpload($event: any) {
    /*
      Triggered by the 'messageEvent' listener on the component template.
      The child 'picture-upload-component' will emit a chosen image as
      a base64 string when an image is chosen. We'll listen for that change
      here and grab the string for saving to storage & patching into the service.
    */
    // console.log(`received base64 image string: ${$event}`);
    this.uploadedImage = $event;
    if (!this.uploadedImage) {
      return;
    }

    // auto save any new image to storage

    // old version
    // const url = await this.storageService.storeServiceImageUpdateDownloadUrl(this.service.sellerUid, this.uploadedImage);
    // this.service.image = url; // assigns a storage downloadURL string

    // new version (optimized)
    const response = await this.cloudFunctions
      .uploadServiceImage({uid: this.service.sellerUid, img: this.uploadedImage})
      .catch(e => console.log(e));

    // @ts-ignore
    const url = await response.original.fullSize || '';
    this.service.image = url;
    // @ts-ignore
    this.service.imagePaths = await response;

    // auto save the service now that it has a new image
    this.dataService.savePrivateService(this.service.sellerUid, this.service);
  }

  async approveService() {
    this.approving = true;

    // safety checks
    if (!this.reviewRequest) {
      this.alertService.alert('warning-message', 'Oops', 'Missing review request. Unable to approve service.');
      this.approving = false;
      return;
    }
    if (!this.serviceId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing service ID. Unable to approve service.');
      this.approving = false;
      return;
    }
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing admin user ID. Unable to approve service.');
      this.approving = false;
      return;
    }

    // attempt approval
    const res = await this.alertService.alert('warning-message-and-confirmation', 'Confirm', 'Are you sure you want to approve this service?', 'Yes - Approve', 'Cancel') as any;
    if (res && res.action) { // user confirms
      console.log('Sending service review approval:', this.serviceId, this.userId, this.reviewRequest);
      const response = await this.cloudFunctionsService.adminApproveServiceReview(this.serviceId, this.userId, this.reviewRequest) as any;
      if (response.error) { // error
        this.alertService.alert('warning-message', 'Oops', JSON.stringify(response));
        this.approving = false;
        return;
      }
      // success
      this.analyticsService.adminApproveService(this.serviceId);
      await this.alertService.alert('success-message', 'Success!', 'Service Approved.');
      this.router.navigate(['/admin-service-review']);
    }
    this.approving = false;
  }

  async rejectService() {
    this.rejecting = true;

    // safety checks
    if (!this.serviceId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing service ID. Unable to reject service.');
      this.rejecting = false;
      return;
    }
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing user ID. Unable to approve service.');
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
    const response = await this.cloudFunctionsService.adminRejectServiceReview(this.serviceId, this.userId, this.reviewRequest) as any;
    if (response.error) { // error
      this.alertService.alert('warning-message', 'Oops', JSON.stringify(response));
      this.rejecting = false;
      return;
    }
    // success
    this.rejecting = false;
    this.analyticsService.adminRejectService(this.serviceId);
    await this.alertService.alert('success-message', 'Success!', 'Service rejected. Feedback sent to service creator.');
    this.router.navigate(['/admin-service-review']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
