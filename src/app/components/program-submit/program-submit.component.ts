import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-program-submit',
  templateUrl: './program-submit.component.html',
  styleUrls: ['./program-submit.component.scss']
})
export class ProgramSubmitComponent implements OnInit, OnChanges, OnDestroy {

  @Input() userId: string;
  @Input() program: CoachingProgram;

  public browser: boolean;
  public loadingProfile: boolean;
  public requesting: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    private dataService: DataService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
    }
  }

  ngOnChanges() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.userId && this.program && (!this.program.coachName || !this.program.coachPhoto)) { // if the program has no coach name or photo yet
        this.loadUserProfile();
      }
    }
  }

  loadUserProfile() {
    // perform a background load of the user's public user profile if they have one.
    // program submission should not be allowed until a user has a public profile.
    // when the user has a public profile, add their name and photo to the program object.
    this.loadingProfile = true;
    this.subscriptions.add(
      this.dataService.getPublicCoachProfile(this.userId).subscribe(profile => {
        if (profile && profile.firstName && profile.lastName && profile.photo) {
          this.program.coachName = `${profile.firstName} ${profile.lastName}`;
          this.program.coachPhoto = profile.photo;
          // console.log('Fetched profile', profile);
        }
        this.loadingProfile = false;
      })
    );
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    return `${day} ${date.toLocaleDateString()}`;
  }

  isProgramValid(program: CoachingProgram) {
    if (!program) {
      return false;
    }
    if (program.reviewRequest && program.reviewRequest.status === 'submitted') {
      return false;
    }
    if (program.reviewRequest && program.reviewRequest.status === 'in-review') {
      return false;
    }
    if (program.reviewRequest && program.reviewRequest.status === 'approved') {
      return false;
    }
    if (!program.programId) {
      return false;
    }
    if (!program.title) {
      return false;
    }
    if (!program.subtitle) {
      return false;
    }
    if (!program.description) {
      return false;
    }
    if (!program.language) {
      return false;
    }
    if (!program.category) {
      return false;
    }
    if (!program.level) {
      return false;
    }
    if (!program.subject) {
      return false;
    }
    if (!program.pricingStrategy) {
      return false;
    }
    if (!program.currency) {
      return false;
    }
    if (!program.fullPrice) {
      return false;
    }
    if (program.pricingStrategy === 'flexible' && !program.pricePerSession) {
      return false;
    }
    if (!program.sellerUid) {
      return false;
    }
    if (!program.stripeId) {
      return false;
    }
    if (!program.coachName) {
      return false;
    }
    if (!program.coachPhoto) {
      return false;
    }
    return true;
  }

  async onSubmit() {
    this.requesting = true;

    // return if no program
    if (!this.program) {
      this.alertService.alert('warning-message', 'Program missing. Unable to submit. Please contact support.');
      this.requesting = false;
      return;
    }

    // check if program valid
    if (!this.isProgramValid(this.program)) {
      this.alertService.alert('warning-message', 'Program invalid for review submission. Please contact support.');
      this.requesting = false;
      return;
    }

    // ***** ADMIN ONLY for testing *****
    // mark program as test
    // run this locally - remember to comment out before releasing!!!
    // this.program.isTest = true;

    // autosave the program now that we've added additional seller profile data
    await this.dataService.savePrivateProgram(this.program.sellerUid, this.program);

    // request review
    this.dataService.requestProgramReview(this.program);

    // Mark user task complete
    this.dataService.completeUserTask(this.program.sellerUid, 'taskDefault003');

    // Done
    this.alertService.alert('success-message', 'Success!', 'Your program is now in review!');
    this.requesting = false;
    this.analyticsService.submitProgramForReview();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
