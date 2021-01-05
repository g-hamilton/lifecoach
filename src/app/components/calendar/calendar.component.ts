import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CalendarView} from 'angular-calendar';
import {Subject, Subscription} from 'rxjs';
import {ModalDirective} from 'ngx-bootstrap/modal';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CustomCalendarEvent} from '../../interfaces/custom.calendar.event.interface';
import {DataService} from 'app/services/data.service';
import {AuthService} from 'app/services/auth.service';
import { take, map } from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {AlertService} from '../../services/alert.service';
import { Router } from '@angular/router';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { CancelCoachSessionRequest } from 'app/interfaces/cancel.coach.session.request.interface';
import { AnalyticsService } from 'app/services/analytics.service';
import { CrmPeopleService } from 'app/services/crm-people.service';

@Component({
  selector: 'app-calendar',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './calendar.component.html',
})

export class CalendarComponent implements OnInit, OnDestroy {

  @ViewChild('eventDetailModal', {static: false}) public eventDetailModal: ModalDirective;
  @ViewChild('editEventModal', {static: false}) public editEventModal: ModalDirective;
  @ViewChild('cancelEventModal', {static: false}) public cancelEventModal: ModalDirective;

  private userId: string;

  public view: CalendarView = CalendarView.Week;
  public viewDate: Date = new Date();
  public daysInWeek = 7;
  public refresh: Subject<any> = new Subject(); // allows us to refresh the view when data changes
  public activeEvent: CustomCalendarEvent;
  public activeEventForm: FormGroup;
  public saveAttempt: boolean;
  public saving: boolean;
  public cancelling: boolean;

  public focus: boolean;
  public focus1: boolean;
  public focusTouched: boolean;
  public focus1Touched: boolean;

  public eventTypes = [
    { id: 'discovery', name: 'Set me as available for discovery calls'},
    { id: 'session', name: 'Schedule a client session'}
  ];

  public events: CustomCalendarEvent[];

  sessionDuration = 30;
  breakDuration = 15;
  endTimes: Date[] | [];
  startTimes: Date[] | [];

  public clients = []; // an array contining this coach's clients

  private subscriptions: Subscription = new Subscription();
  public objKeys = Object.keys;

  public ErrorMessages = {
    type: {
      required: `Please select a calendar action.`
    }
  };

  constructor(
    private authService: AuthService,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private toastService: ToastrService,
    public alertService: AlertService,
    private router: Router,
    private cloudFunctionsService: CloudFunctionsService,
    private analyticsService: AnalyticsService,
    private crmPeopleService: CrmPeopleService
  ) {
  }

  ngOnInit() {
    this.buildActiveEventForm();
    this.loadUserData();
    this.endTimes = [];
    this.startTimes = [];
    console.log('View date:', this.viewDate);
  }

  buildActiveEventForm() {
    this.activeEventForm = this.formBuilder.group(
      {
        id: [null, Validators.required],
        type: [null, Validators.required],
        title: [null],
        start: [null, Validators.required],
        end: [null, Validators.required],
        draggable: [null],
        cssClass: [null],
        description: [null],
        client: [null]
      }
    );
  }

  get activeEventF(): any {
    return this.activeEventForm.controls;
  }

  loadUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          console.log('USER OBJ:', user);
          this.userId = user.uid;
          this.subscriptions.add(
            this.dataService.getUserAccount(this.userId).pipe(take(1)).subscribe(userAccount => {
                this.sessionDuration = userAccount.sessionDuration ? userAccount.sessionDuration : 30;
                this.breakDuration = userAccount.breakDuration ? userAccount.breakDuration : 0;
              }
            )
          );

          this.subscriptions.add(
            this.dataService.getUserCalendarEvents(this.userId, this.viewDate)
            .pipe(
              map(i => this.filterEvents(i))
            )
            .subscribe(events => {
              if (events) {
                console.log('events before forEach', events);
                // important: update date objects as Firebase stores dates as unix string: 't {seconds: 0, nanoseconds: 0}'
                events.forEach((ev: CustomCalendarEvent) => {
                  if (ev.start) {
                    ev.start = new Date((ev.start as any).seconds * 1000);
                  }
                  if (ev.end) {
                    ev.end = new Date((ev.end as any).seconds * 1000);
                  }
                  ev.title = this.getTitle(ev);
                  // ev.title = ev.reserved ? (ev.ordered ? 'ORDERED' : 'RESERVED') : 'FREE';
                  ev.cssClass = ev.ordered ? 'ordered' : 'free' ;
                });

                this.events = events;
                this.refresh.next(); // refresh the view

                // console.log(this.events);
              }
            })
          );

          // monitor this coach's clients
          this.subscriptions.add(
            this.crmPeopleService.getUserPeople(this.userId)
            .subscribe(async people => {
              if (people) {
                // note: a person is a client if they have enrolled in a course or program, so check their history...
                const filledPeople = await this.crmPeopleService.getFilledPeople(this.userId, people);
                // console.log('filled people', filledPeople);
                const clients = filledPeople.filter(o => o.history.filter(h => h.action === 'enrolled_in_full_program' ||
                h.action === 'enrolled_in_program_session' || h.action === 'enrolled_in_self_study_course'));
                console.log('Clients:', clients);
                this.clients = clients;
              }
            })
          );

        }
      })
    );
  }

  filterEvents(arr: CustomCalendarEvent[]) {
    const noCancelledEvents = arr.filter(i => !i.cancelled);
    return noCancelledEvents;
  }

  getTitle(ev: CustomCalendarEvent) {
    let title = '';
    if (ev.type === 'discovery') {
      title = ev.ordered ? `Discovery with ${ev.orderedByName}` : 'Available';
    } else if (ev.type === 'session') {
      title = `Session with ${ev.orderedByName}`;
    }
    return title;
  }

  loadActiveEventFormData() {
    this.activeEventForm.patchValue({
      id: this.activeEvent.id ? this.activeEvent.id : null,
      type: this.activeEvent.type ? this.activeEvent.type : null,
      start: this.activeEvent.start ? this.activeEvent.start : null,
      end: this.activeEvent.end ? this.activeEvent.end : null,
      title: this.activeEvent.start.toLocaleTimeString() + ' - ' + (this.activeEvent.end.toLocaleTimeString() || ' '),
      draggable: false,
      description: this.activeEvent.description ? this.activeEvent.description : null,
      reserved: this.activeEvent.reserved ? this.activeEvent.reserved : false,
      reservedById: this.activeEvent.reservedById ? this.activeEvent.reservedById : null,
      ordered: this.activeEvent.ordered ? this.activeEvent.ordered : null,
      orderedById: this.activeEvent.orderedById ? this.activeEvent.orderedById : null,
      cssClass: this.activeEvent.cssClass ? this.activeEvent.cssClass : null,
      client: this.activeEvent.client ? this.activeEvent.client : null,
    });
  }

  onColumnClicked(event: any) {
    // console.log('clicked column:', event.isoDayNumber);
  }

  onDayClicked(event: any) {
    // console.log('clicked day:', event.day.date);
    // this.createEvent(event.day.date);
  }

  onDayHeaderClicked(event: any) {
    // console.log('clicked day header:', event.day.date);
    // this.createEvent(event.day.date);
  }
  onHourSegmentClicked(event: any) {
    // if (event.date < new Date(Date.now() + 60000 * 30) ) { // 30 minutes for planning event
    //   alert('You can`t pick date, which has already been'); // TODO: Modal
    //   return;
    // }
    this.createEvent(event.date);
    this.fillEndTimes(event);
    this.fillStartTimes(event);
  }
  toTimeStampFromStr(strDate: string): number {
    return Date.parse(strDate) / 1000;
  }
  fillEndTimes(event: any, dontPop?: boolean ) {
    console.log('Event', event.date);
    let date: Date;
    if (event.date !== undefined && event.date.status === undefined) {
      date = event.date instanceof Date ? new Date(event.date) : new Date(this.toTimeStampFromStr(event.target.value) * 1000);
    } else {
      date = new Date(event.date.value);
    }
    let newTime: Date = date;
    console.group('test');
    // console.log('EndTimes before cleaning', this.endTimes);
    this.endTimes = [];
    console.group('Session settings in compomnent');
    console.log(this.sessionDuration);
    console.log(this.breakDuration);
    console.groupEnd();
    while (newTime.getDate() === date.getDate()) {
      console.log('Date: ', date.getDate(), 'NewTime: ', newTime.getDate());
      newTime = new Date(newTime.setMinutes(newTime.getMinutes() + this.sessionDuration));
      this.endTimes = [...this.endTimes, newTime];
      newTime = new Date(newTime.setMinutes(newTime.getMinutes() + this.breakDuration));
    }
    this.endTimes.pop();
    // console.log('After Pop', this.endTimes);
    this.activeEventForm.patchValue({
      end: this.endTimes[0]
    });
    // console.log('In the End', this.endTimes);
    console.groupEnd();
  }
  createEvent(date: Date) {
    // console.log('Create event', date);

    // prepare a new event object
    const newEvent: CustomCalendarEvent = {
      id: Math.random().toString(36).substr(2, 9), // generate semi-random id
      type: null,
      title: 'New Event',
      start: date,
      end: date
    };

    // load the new event as the active event
    this.activeEvent = newEvent;
    this.loadActiveEventFormData();

    // pop the edit event modal
    this.editEventModal.show();
  }

  eventClicked({event}: { event: CustomCalendarEvent }): void {
    this.activeEvent = event;
    console.log(event);

    this.eventDetailModal.show();
    console.log('TEST, TEST, TEST', this.activeEventF);
  }

  onEventDetailModalClose() {
    this.eventDetailModal.hide();
    this.activeEventForm.patchValue({
      id: null,
      start: null,
      end: null,
      // title: this.activeEvent.start.toLocaleTimeString() + ' - ' + (this.activeEvent.end.toLocaleTimeString() || ' '),
      draggable: false,
      cssClass:  null,
      description: null,
      reservedById: null,
      reserved: false,
      ordered: false,
      orderedById: null,
    });
    this.activeEvent = null;
  }

  onEditEventModalClose() {
    this.editEventModal.hide();
    this.activeEvent = null;
    this.activeEventForm.patchValue({
      id: null,
      start: null,
      end: null,
      // title: this.activeEvent.start.toLocaleTimeString() + ' - ' + (this.activeEvent.end.toLocaleTimeString() || ' '),
      draggable: false,
      cssClass:  null,
      description: null,
      reserved: false,
      reservedById: null,
    });
    this.activeEvent = null;
  }

  onEditEvent() {

    this.eventDetailModal.hide();
    console.log('275,', this.activeEvent);
    if (this.activeEvent.reserved) {
      alert(`Sorry, this event was already reserved by the user: ${this.activeEvent.reservedById}`); // TODO: Modal
      return;
    }
    // this.activeEvent = null;
    console.log('TEST, TEST, TEST', this.activeEventF);
    this.startTimes = [];
    this.endTimes = [];
    this.loadActiveEventFormData();
    this.fillStartTimes({date: this.activeEventF.start});
    this.fillEndTimes({ date: this.activeEventF.start}, true);

    this.editEventModal.show();
    // this.activeEventForm.patchValue({
    //   id: null,
    //   start: null,
    //   end: null,
    //   // title: this.activeEvent.start.toLocaleTimeString() + ' - ' + (this.activeEvent.end.toLocaleTimeString() || ' '),
    //   draggable: false,
    //   cssClass:  null,
    //   description: null
    // });
  }

  onDetailDeleteEvent() {
    this.eventDetailModal.hide();

    // if this is an available discovery slot, no need to confirm or notify other participant. just delete..
    if (this.activeEvent.type === 'discovery' && !this.activeEvent.reserved && !this.activeEvent.ordered) {
      this.onDeleteEvent();
      return;
    }

    // if this is an ordered discovery slot...
    if (this.activeEvent.type === 'discovery' && this.activeEvent.ordered) {

      // probably should not let the user cancel if time is within 5 minutes of start or the session has already started.
      // What should we do if event is in the past? Allow delete?
      // Todo: pop a modal advising user to join the session and tell the other person they have to cancel on the call?
      // return;

      this.cancelEventModal.show();
      return;
    }

    // if this is a coach created client session
    if (this.activeEvent.type === 'session') {

      // anything special?

      this.cancelEventModal.show();
      return;
    }
  }

  onEditDeleteEvent() {
    this.editEventModal.hide();
    this.cancelEventModal.show();
  }

  onCancelEventModalClose() {
    this.cancelEventModal.hide();
    this.activeEvent = null;
    this.activeEventForm.reset();
  }

  async onDeleteEvent() {

    this.cancelling = true;

    // delete the event
    const request: CancelCoachSessionRequest = {
      eventId: this.activeEvent.id,
      cancelledById: this.userId
    };
    const res = await this.cloudFunctionsService.cancelCoachSession(request) as any;

    if (res.error) { // error
      this.cancelling = false;
      this.alertService.alert('warning-message', 'Oops', `Error: ${JSON.stringify(res.error)}. Please contact hello@lifecoach.io for support.`);
    }

    // success

    this.cancelling = false;
    this.cancelEventModal.hide();
    this.activeEvent = null;
    this.activeEventForm.reset();
    this.analyticsService.cancelCoachSession(this.activeEvent.type, this.activeEvent.id, this.userId);
  }

  isTheSameDay(a: Date, b: Date): boolean {
    return (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDay() === b.getDay());
  }

  divideEventIntoSessions(ob: CustomCalendarEvent): Array<CustomCalendarEvent> {
    console.log('divider', ob);
    const result: Array<CustomCalendarEvent> = [];
    const startTime = new Date(ob.start).getTime();
    const endTime = ob.end.getTime();
    console.log(ob.start, ob.end);
    if (endTime - startTime !== this.sessionDuration * 60000 + this.breakDuration * 60000) {
      let expireTime: number = startTime;
      console.log('Was divided');
      while (expireTime < endTime) {
        const ev = {
          ...ob,
          // title: `${new Date(expireTime).toLocaleTimeString()} - ${new Date(expireTime + this.sessionDuration * 60000).toLocaleTimeString()}`,
          title: ob.reservedById ? (ob.ordered ? 'Ordered' : 'reserved') : 'Available',
          start: new Date(expireTime),
          end: new Date(expireTime + this.sessionDuration * 60000),
          id: Math.random().toString(36).substr(2, 9),
          reserved: false,
          reservedById: null,
          ordered: false,
          orderedById: null,
          cssClass: ob.reservedById ? (ob.ordered ? 'orderedSession' : 'reserved') : 'not',
        };
        console.log(ev);
        result.push(ev);
        expireTime += this.sessionDuration * 60000 + this.breakDuration * 60000;
      }
    } else {
      console.log('соло ивент');
      result.push({
        ...ob,
        end: new Date(ob.end.getTime() - this.breakDuration * 60000),
        title: ob.reservedById ? (ob.ordered ? 'Ordered' : 'reserved') : 'I am free',
        reserved: false,
        reservedById: null,
        ordered: false,
        orderedById: null,
        cssClass: ob.reservedById ? (ob.ordered ? 'orderedSession' : 'reserved') : 'not',
      });
    }
    return result;
  }
  onUpdateEvent() {
    this.saveAttempt = true;
    this.saving = true;

    // safety checks
    if (this.activeEventForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields before saving.');
      this.saving = false;
      return;
    }

    // if the event has no id, create one id now
    if (!this.activeEventF.id.value) {
      this.activeEventForm.patchValue({id: Math.random().toString(36).substr(2, 9)}); // generate semi-random id
    }

    console.log(this.activeEventF);
    console.log('Events', this.events);

    const ev = this.activeEventForm.value;
    ev.start = new Date(ev.start);
    const thisDayEvents = this.events !== undefined ?
      this.events
        .filter( item => this.isTheSameDay(item.start, ev.start))
        : undefined;
    console.log(thisDayEvents);
    let error = false;
    if (thisDayEvents.length) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < thisDayEvents.length; i++) {
        if ((this.toTimeStampFromStr(ev.start) < this.toTimeStampFromStr(thisDayEvents[i].end.toString())
          && (this.toTimeStampFromStr(ev.start) > this.toTimeStampFromStr(thisDayEvents[i].start.toString())))
          || (this.toTimeStampFromStr(ev.end) > this.toTimeStampFromStr(thisDayEvents[i].start.toString()))
          && (this.toTimeStampFromStr(ev.end) < this.toTimeStampFromStr(thisDayEvents[i].end.toString()))) {
          error = true;
        }

      }
    }
    if (error) {
      // TODO: It will be better to do a Modal with warning;
      // alert('Choose other date!'); // TODO: Modal
      this.saving = false;
      this.alertService.alert(
          'warning-message',
        'Choose other time!',
          'Our apologizes. System is working in test-mode. Please, choose time which will not across Your other free time events',
        'ok',
        'btn btn-round btn-success',
      ).then(() => console.log('ended'));
      return;
    }
    // Make a divider there
    //
    // ev.title = `${ev.start.toLocaleTimeString()} - ${ev.end.toLocaleTimeString()}`;
    this.divideEventIntoSessions(ev)
      .forEach(i => {
        this.dataService.saveUserCalendarEvent(this.userId, i.start, i);
        this.eventNotification(ev);
      });
    console.log(ev);
    // save the event
    if (!this.userId) {
      alert('No user ID'); // TODO: Modal
      return;
    }
    // this.dataService.saveUserCalendarEvent(this.userId, ev.start, ev);

    this.saving = false;
    this.saveAttempt = false;

    // dismiss the modal
    this.editEventModal.hide();

    // reset the active event
    this.activeEvent = null;
    this.activeEventForm.reset();
  }

  eventNotification( ev: any ) {
    console.log(ev);
    this.toastService.show( '<span data-notify="icon" class="tim-icons icon-calendar-60"></span>',
      `Calendar updated.
      ${this.getTitle(ev)} from ${ev.start.toLocaleString()} until ${ev.end.toLocaleString()}`,
      {
        timeOut: 4000,
        closeButton: true,
        enableHtml: true,
        toastClass: 'alert alert-success alert-with-icon',
        positionClass: 'toast-top-right'
      });
  }

  onGoToSession() {
    this.eventDetailModal.hide();
    console.log('Active event:', this.activeEvent);
    this.router.navigate(['/my-sessions', this.activeEvent.sessionId]);
  }

  onChangeStartTimeHandler(event: any) {
    console.log('Event', event,
      'Times changed', event.target.value );
    this.fillEndTimes({date: new Date(Date.parse(event.target.value))});

  }

  fillStartTimes(event: any) {
    this.startTimes = [];
    console.log('EVENT', event);
    const oldTime: Date = event.date instanceof Date ? event.date : event.date.value ;
    let newTime = new Date(oldTime);
    this.startTimes = [oldTime, ...this.startTimes];
    let isOneDay = true;
    while ( isOneDay ) {
      // newTime = new Date(newTime.setMinutes(newTime.getMinutes() + this.sessionDuration));
      newTime = new Date(newTime.getTime() + this.sessionDuration * 60000);
      console.log(newTime + '\n');
      if (newTime.getDay() !== oldTime.getDay()) {
        console.log('BREAKED');
        isOneDay = false;
      }
      this.startTimes =  [...this.startTimes, newTime ];
    }
    console.log('This,startTimes', this.startTimes);
    this.activeEventForm.patchValue({
      start: this.startTimes[0]
    });
  }

  showError(control: string, error: string) {
    // console.log(`Form error. Control: ${control}. Error: ${error}`);
    if (this.ErrorMessages[control][error]) {
      return this.ErrorMessages[control][error];
    }
    return 'Invalid input';
  }

  getDisplayDate(date: Date) {
    if (!date) {
      return '';
    }
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[date.getDay()];
    return `${day} - ${date.toLocaleDateString()}`;
  }

  getDisplaytime(date: Date) {
    if (!date) {
      return '';
    }
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}); // exclude seconds
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
