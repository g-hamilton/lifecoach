import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CustomCalendarEvent } from 'app/interfaces/custom.calendar.event.interface';
import { AuthService } from 'app/services/auth.service';
import { DataService } from 'app/services/data.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

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
  private subscriptions: Subscription = new Subscription();
  public uniqueEnabledDays: Array<Date> = [];
  public timeToSelect: Array<Date> = [];
  public discoveryAvailableEvents: CustomCalendarEvent[] | [];
  public availableSlotsToday: Array<any>;

  // ngx datePicker
  public bsInlineValue = new Date();
  public dateSelectConfig = { } as BsDatepickerConfig;
  public disabledDates: Array<Date> = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    public bsModalRef: BsModalRef,
    private dataService: DataService,
    private authService: AuthService,
    private toastrService: ToastrService,
    private router: Router
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
            this.getCoachCalendarEvents();
          }
        }, error => console.log('error logger', error.message))
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

  reserveSession($event: any) {
    this.dataService.reserveEvent(this.userId, this.coachId, $event.target.value).then( r => console.log('Reserved'));
    this.showNotification();
  }

  showNotification() {
    this.toastrService.success('<span data-notify="icon" class="tim-icons icon-bell-55"></span>You have 15 minutes for confirm Your reservation. Click here to redirect lifecoach.io/reserved.sessions',
      `You have successfully reserved event`,
      {
        timeOut: 8000,
        closeButton: true,
        enableHtml: true,
        toastClass: 'alert alert-danger alert-with-icon',
        positionClass: 'toast-top-right'
      }, )
      .onTap
      .pipe(take(1))
      .subscribe(() => this.router.navigate(['/reserved-sessions']));
  }

}
