import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CustomCalendarEvent } from 'app/interfaces/custom.calendar.event.interface';
import { OrderCoachSessionRequest } from 'app/interfaces/order.coach.session.request.interface';
import { AlertService } from 'app/services/alert.service';
import { AuthService } from 'app/services/auth.service';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { DataService } from 'app/services/data.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

/*
  This component is designed to be a re-usable modal.
  Allows users to schedule calls with coaches on available coach calendar slots
*/

@Component({
  selector: 'app-schedule-call',
  templateUrl: './schedule-call.component.html',
  styleUrls: ['./schedule-call.component.scss']
})
export class ScheduleCallComponent implements OnInit {

  // modal config
  public coachId: string; // pass the coach ID in through the modalOptions

  // component
  public browser: boolean;
  public userId: string;
  private userProfileName: string;
  private userProfilePhoto: string;
  private subscriptions: Subscription = new Subscription();
  public uniqueEnabledDays: Array<Date> = [];
  public timeToSelect: Array<Date> = [];
  public discoveryAvailableEvents: CustomCalendarEvent[] | [];
  public availableSlotsToday: Array<any>;
  public reserving: boolean;

  // ngx datePicker
  public bsInlineValue = new Date();
  public dateSelectConfig = { } as BsDatepickerConfig;
  public disabledDates: Array<Date> = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    public bsModalRef: BsModalRef,
    private dataService: DataService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private cloudFunctionsService: CloudFunctionsService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.getUser();
    }
  }

  getUser() {
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.userId = user.uid;
            this.getUserProfileData();
            this.getCoachCalendarEvents();
          }
        }, error => console.log('error logger', error.message))
    );
  }

  getUserProfileData() {
    this.subscriptions.add(
      this.dataService.getRegularProfile(this.userId).subscribe(regProfile => {
        if (regProfile) {
          this.userProfileName = `${regProfile.firstName} ${regProfile.lastName}`;
          this.userProfilePhoto = regProfile.photo ? regProfile.photo :
            `https://eu.ui-avatars.com/api/?name=${regProfile.firstName}+${regProfile.lastName}`; // https://eu.ui-avatars.com/
        }
      })
    );
  }

  getCoachCalendarEvents() {
    // fetch this coach's discovery type events that are still available for booking
    this.subscriptions.add(
      this.dataService.getUserAvailableDiscoveryEvents(this.coachId).subscribe(next => {
        console.log(next);
        if (next) {
          this.discoveryAvailableEvents = next;

          // calculate the unique days that have an available discovery event
          this.uniqueEnabledDays = [];
          this.discoveryAvailableEvents.forEach( i => {
            // @ts-ignore
            const startDate = new Date(i.start.seconds * 1000);
            const day = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
            if (!this.uniqueEnabledDays.some( (date) => this.isSameDay(date, day))) {
              this.uniqueEnabledDays.push(day);
            }
          });
          }
        console.log('Unique enabled days:', this.uniqueEnabledDays);

        // now we have the unique available days, calculate the dates to disable on the calendar
        // Note: this is a required workaround because of a bug in ngx-bootstrap datePicker where
        // datesEnabled is not working.
        this.GetDisabledDates(this.uniqueEnabledDays);
      },
        error => console.log('error logger', error.message))
    );
  }

  GetDisabledDates(enabledDates: Array<Date>) {
    /*
      Required workaround to reverse datesEnabled. Pass in an array of dates to enable and this method
      will populate an array of dates to disable.
      Disables every date between a defined start and end point that is not in the enabled array.
    */
    const millisecondPerDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    let startDate: Date = new Date(now.setFullYear(now.getFullYear() - 1));
    const endDate: Date = new Date(now.setFullYear(now.getFullYear() + 2)); // change as per need
    console.log('get disabled dates start:', startDate);
    console.log('get disabled dates end:', endDate);
    this.disabledDates = [];
    do {
      let found = false;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < enabledDates.length; i++) {
        const excludeDate: Date = enabledDates[i];
        if (this.isSameDay(excludeDate, startDate)) {
          found = true;
        }
      }
      if (!found) {
        this.disabledDates.push(startDate);
      }
      startDate = new Date((startDate.getTime() + millisecondPerDay));
    } while (startDate <= endDate);
    console.log('Calculated disabled dates number: ' + this.disabledDates.length);
    // console.log('Calculated disabled dates: ', this.disabledDates);
  }

  onDayChange(value: Date) {
    console.log('day changed', value);
    this.subscriptions.add(
      this.dataService.getUserAvailableDiscoveryEvents(this.coachId, new Date(value))
        .subscribe(next => {
        this.availableSlotsToday = next;
      })
    );
  }

  isSameDay(a: Date, b: Date) {
    return (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate());
  }

  async reserveSession(ev: CustomCalendarEvent) {
    // console.log('calendar event', ev);

    this.reserving = true;

    // skip reserving for limited time and go straight to booking (no payment required)
    const request: OrderCoachSessionRequest = {
      coachId: this.coachId,
      event: ev,
      uid: this.userId,
      userName: this.userProfileName,
      userPhoto: this.userProfilePhoto
    };

    const res = await this.cloudFunctionsService.orderCoachSession(request) as any;
    if (res.error) { // error
      this.reserving = false;
      this.bsModalRef.hide();
      this.alertService.alert('warning-message', 'Oops', `Error: ${res.error}. Please contact hello@lifecoach.io for support.`);
    }
    // success
    this.reserving = false;
    console.log(`Session with ID ${ev.id} booked between coach ${this.coachId} and user ${this.userId}`);
    this.bsModalRef.hide();
    this.showReservedAlert();
  }

  async showReservedAlert() {
    const res = await this.alertService.alert('success-message', 'Success!', 'Your discovery session is scheduled with this Coach. Click OK to view it now...', 'OK') as any;
    if (res && res.action) { // user confirms
      this.router.navigate(['/my-sessions']);
    }
  }

}
