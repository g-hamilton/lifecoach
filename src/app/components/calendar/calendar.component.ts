import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CalendarView} from 'angular-calendar';
import {Subject, Subscription} from 'rxjs';
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
import { CRMPerson, EnrolledProgram } from 'app/interfaces/crm.person.interface';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { ModalDirective, BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { SessionManagerComponent } from 'app/components/session-manager/session-manager.component';
import { SessionManagerConfig } from 'app/interfaces/session.manager.config.interface';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-calendar',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './calendar.component.html'
})

export class CalendarComponent implements OnInit, OnDestroy {

  @ViewChild('eventDetailModal', {static: false}) public eventDetailModal: ModalDirective;
  @ViewChild('editEventModal', {static: false}) public editEventModal: ModalDirective;
  @ViewChild('cancelEventModal', {static: false}) public cancelEventModal: ModalDirective;
  @ViewChild('rescheduleEventModal', {static: false}) public rescheduleEventModal: ModalDirective;

  public bsModalRef: BsModalRef;

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
  public isReschedulingMode: true | false = false;
  public oldEventID: | undefined = undefined;

  public focus: boolean;
  public focus1: boolean;
  public focus2: boolean;
  public focusTouched: boolean;
  public focus1Touched: boolean;
  public focus2Touched: boolean;

  public eventTypes = [
    { id: 'discovery', name: 'Set me as available for discovery calls'},
    { id: 'session', name: 'Schedule a client session'}
  ];

  public events: CustomCalendarEvent[];

  sessionDuration = 30;
  breakDuration = 15;
  endTimes: Date[] | [];
  startTimes: Date[] | [];

  public clients = [] as CRMPerson[]; // an array contining this coach's clients
  public coachPrograms = [] as CoachingProgram[]; // an array containing this coach's programs

  private subscriptions: Subscription = new Subscription();
  public objKeys = Object.keys;

  public ErrorMessages = {
    type: {
      required: `Please select a calendar action.`
    }
  };

  // ngx datePicker
  public bsInlineValue = new Date();
  public dateSelectConfig = { } as BsDatepickerConfig;
  public disabledDates: Array<Date> = [];

  constructor(
    private authService: AuthService,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private toastService: ToastrService,
    public alertService: AlertService,
    private router: Router,
    private cloudFunctionsService: CloudFunctionsService,
    private analyticsService: AnalyticsService,
    private crmPeopleService: CrmPeopleService,
    private modalService: BsModalService,

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
        client: [null],
        program: [null],
        orderedByName: [null]
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
          this.getUserAccount();
          this.getCoachCalendarEvents();
          this.loadCoachClients();
          this.loadCoachPrograms();
        }
      })
    );
  }

  getUserAccount() {
    this.subscriptions.add(
      this.dataService.getUserAccount(this.userId).pipe(take(1)).subscribe(userAccount => {
          this.sessionDuration = userAccount.sessionDuration ? userAccount.sessionDuration : 30;
          this.breakDuration = userAccount.breakDuration ? userAccount.breakDuration : 0;
        }
      )
    );
  }

  getCoachCalendarEvents() {
    this.subscriptions.add(
      this.dataService.getUserCalendarEvents(this.userId, this.viewDate)
      .pipe(
        map(i => this.filterEvents(i))
      )
      .subscribe(events => {
        if (events) {
          // console.log('events before forEach', events);
          // important: update date objects as Firebase stores dates as unix string: 't {seconds: 0, nanoseconds: 0}'
          events.forEach((ev: CustomCalendarEvent) => {
            if (ev.start) {
              ev.start = new Date((ev.start as any).seconds * 1000);
            }
            if (ev.end) {
              ev.end = new Date((ev.end as any).seconds * 1000);
            }
            ev.title = this.getTitle(ev);

            // do we need to dynamically update the css class here in the front end?
            // if event has been ordered, is not complete and is in the past - set to needs-action
            if (ev.ordered && !ev.complete && ev.end < this.dateNow) {
              ev.cssClass = 'needs-action';
            }

          });

          this.events = events;
          this.refresh.next(); // refresh the view

          // console.log(this.events);
        }
      })
    );
  }

  loadCoachClients() {
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
          // work out which programs each client is enrolled in
          clients.forEach(c => {
            const programIds = [];
            if (c.history) {
              c.history.forEach(i => {
                if (i.action === 'enrolled_in_program_session' || i.action === 'enrolled_in_full_program') {
                  programIds.push(i.programId);
                }
              });
              const uniqueProgramIds = [...new Set(programIds)]; // remove any duplicates
              // work out how many purchased sessions remain for each program the person is enrolled in
              c.enrolledPrograms = [];
              uniqueProgramIds.forEach(p => {
                this.dataService.getPurchasedProgramSessions(this.userId, c.id, p)
                .pipe(take(1))
                .subscribe(sessions => {
                  if (sessions && sessions.length) {
                    this.dataService.getPublicProgram(p)
                    .pipe(take(1))
                    .subscribe(pubProgram => {
                      if (pubProgram) {
                        c.enrolledPrograms.push({
                          id: p,
                          purchasedSessions: sessions.length,
                          title: pubProgram.title
                        });
                      }
                    });
                  }
                });
              });
            }
          });
          this.clients = clients;
          console.log('Clients:', clients);
        }
      })
    );
  }

  loadCoachPrograms() {
    this.subscriptions.add(
      this.dataService.getPublicProgramsBySeller(this.userId)
      .subscribe(programs => {
        if (programs) {
          this.coachPrograms = programs;
        }
      })
    );
  }

  getProgram(id: string) {
    return this.coachPrograms.filter(i => i.programId === id)[0];
  }

  get dateNow() {
    return new Date();
  }

  filterEvents(arr: CustomCalendarEvent[]) {
    // const noCancelledEvents = arr.filter(i => !i.cancelled);
    // return noCancelledEvents;
    return arr; // no filtering at this time
  }

  getTitle(ev: CustomCalendarEvent) {
    let title = '';
    if (ev.type === 'discovery') { // discovery sessions
      if (ev.ordered && !ev.cancelledTime) {
        title = `Discovery with ${ev.orderedByName}`;
      } else if (ev.ordered && ev.cancelledTime) {
        title = `Cancelled: Discovery with ${ev.orderedByName}`;
      } else {
        title = 'Available';
      }
    } else if (ev.type === 'session') { // coaching sessions
      if (ev.cancelledTime) {
        title = `Cancelled: ${ev.orderedByName}`;
      } else {
        title = `${ev.orderedByName}`;
      }
    }
    return title;
  }

  getClientPrograms(clientId: string) {
    return this.clients.filter(i => i.id === clientId)[0].enrolledPrograms as EnrolledProgram[];
  }

  clientHasPurchasedProgramSessions(clientId: string, programId: string) {
    const enrolledPrograms = this.getClientPrograms(clientId);
    const purchasedSessions = enrolledPrograms.filter(i => i.id === programId)[0].purchasedSessions;
    if (purchasedSessions > 0) {
      return true;
    }
    return false;
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
      orderedByName: this.activeEvent.orderedByName ? this.activeEvent.orderedByName : null,
      cssClass: this.activeEvent.cssClass ? this.activeEvent.cssClass : null,
      client: this.activeEvent.client ? this.activeEvent.client : null,
      program: this.activeEvent.program ? this.activeEvent.program : null,
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
    this.fillStartTimes(event);
    this.fillEndTimes(event);
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
    console.log('Active event:', event);
    this.eventDetailModal.show();
    console.log('Active event FORM:', this.activeEventF);
  }

  onEventDetailModalClose() {
    this.eventDetailModal.hide();
    this.activeEventForm.patchValue({
      id: null,
      start: null,
      end: null,
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
    console.log('TEST, TEST, TEST', this.activeEventF);
    this.startTimes = [];
    this.endTimes = [];
    this.loadActiveEventFormData();
    this.fillStartTimes({date: this.activeEventF.start});
    this.fillEndTimes({ date: this.activeEventF.start}, true);

    this.editEventModal.show();
  }

  onDetailCancelEvent() {
    this.eventDetailModal.hide();

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

  onDeleteEventFromCal() {
    this.dataService.deleteCalendarEvent(this.userId, this.activeEvent);
    this.eventDetailModal.hide();
    this.activeEvent = null;
    this.activeEventForm.reset();
  }

  async onCancelEvent(id?: string) {
    if (!id) {
      this.cancelling = true;

      // cancel the event
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
      // this.analyticsService.cancelCoachSession(this.activeEvent.type, this.activeEvent.id, this.userId);
    } else {
      this.cancelling = true;

      // cancel the event
      const request: CancelCoachSessionRequest = {
        eventId: id,
        cancelledById: this.userId
      };
      const res = await this.cloudFunctionsService.cancelCoachSession(request) as any;

      if (res.error) { // error
        console.log(res.error);
        this.cancelling = false;
        this.alertService.alert('warning-message', 'Oops', `Error: ${JSON.stringify(res.error)}. Please contact hello@lifecoach.io for support.`);
      }

      // success

      this.cancelling = false;
      this.cancelEventModal.hide();
      this.activeEvent = null;
      this.activeEventForm.reset();
    }
  }

  isTheSameDay(a: Date, b: Date): boolean {
    return (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
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
          title: 'Available',
          start: new Date(expireTime),
          end: new Date(expireTime + this.sessionDuration * 60000),
          id: Math.random().toString(36).substr(2, 9),
          reserved: false,
          reservedById: null,
          ordered: false,
          orderedById: null,
          cssClass: 'available',
        };
        // console.log(ev);
        result.push(ev);
        expireTime += this.sessionDuration * 60000 + this.breakDuration * 60000;
      }
    } else {
      // console.log('Not array of events');
      result.push({
        ...ob,
        end: new Date(ob.end.getTime() - this.breakDuration * 60000),
        title: 'Available',
        reserved: false,
        reservedById: null,
        ordered: false,
        orderedById: null,
        cssClass: 'available',
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

    // if the coach is scheduling a client event, insert the client data into the form prior to saving
    if (this.activeEventF.type.value === 'session') {
      if (!this.activeEventF.client.value) {
        this.alertService.alert('warning-message', 'Oops', '`Error: Client ID is missing. Please contact support.');
      }
      const selectedClient = this.clients.filter(i => i.id === this.activeEventF.client.value)[0];
      this.activeEventForm.patchValue({ orderedByName: `${selectedClient.firstName} ${selectedClient.lastName}` });
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
    console.log(ev);
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
      this.saving = false;
      this.alertService.alert('warning-message', 'Oops', 'Please, choose another time that does not cross another event in your calendar.');
      return;
    }

    // safety checks
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', `Error: Missing User ID. Please contact support.`);
      return;
    }

    if (ev.type === 'discovery') { // If creating discovery session(s)
      ev.cssClass = 'available';
      // divide the time period into multiple sessions if required
      console.log('Dividing discovery type event into sessions and saving...');
      this.divideEventIntoSessions(ev)
      .forEach(i => { // save and notify for each individual (divided) event
        this.dataService.saveUserCalendarEvent(this.userId, i.start, i);
        this.eventNotification(ev);
        this.analyticsService.createCoachSession(ev.type, this.userId, ev.id);
      });
    } else if (ev.type === 'session') { // If creating a client coaching session
      ev.cssClass = 'session';
      ev.ordered = true;
      ev.orderedById = this.userId;
      ev.sessionId = ev.id; // note: session will be created by cloud function monitoring the calendar
      ev.title = `Coaching session with ${ev.orderedByName}`;
      this.dataService.saveUserCalendarEvent(this.userId, ev.start, ev); // save and notify this single event
      this.eventNotification(ev);
      this.analyticsService.createCoachSession(ev.type, this.userId, ev.id);
    }

    // done
    this.saving = false;
    this.saveAttempt = false;
    this.editEventModal.hide();
    // reset the active event
    this.activeEvent = null;
    this.activeEventForm.reset();

    // if this is rescheduling - we should close it
    if (this.rescheduleEventModal.isShown) {
      this.rescheduleEventModal.hide();
    }

    // check if that rescheduling
    if (this.oldEventID) {
      this.onCancelEvent(this.oldEventID)
        .then( () => {
          console.log('previous event succesfully deleted');
          this.oldEventID = undefined;
        })
        .catch(e => console.log(e));
    }
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
    this.router.navigate(['/my-sessions', this.activeEvent.sessionId]);
  }

  onViewSessionNotes() {
    this.eventDetailModal.hide();
    const programId = this.activeEvent.type === 'discovery' ? 'discovery' : this.activeEvent.program;
    const clientId = this.activeEvent.client ? this.activeEvent.client : this.activeEvent.orderedById;
    this.router.navigate(['/my-programs', programId, 'clients', clientId, 'sessions', this.activeEvent.sessionId]);
  }

  onRescheduleSession() {
    this.eventDetailModal.hide();
    this.startTimes = [];
    this.endTimes = [];

    this.isReschedulingMode = true;
    const millisecondPerDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    // now.setHours(now.getHours() + 1, 0, 0, 0);
    // console.log('Date', now);
    let startDate: Date = new Date(now.setFullYear(now.getFullYear() - 1));
    const endDate: Date = new Date(now.setFullYear(now.getFullYear() + 2));
    now.setFullYear(now.getFullYear() - 1);
    // console.log('NOW OBJECT', now);
    this.disabledDates = [];
    do { // check every date in the enabled array between the start and end point
      let disable = true; // disable by default

      if (startDate > now) {
        disable = this.isTheSameDay(startDate, now);

      }
      if (disable) {
        this.disabledDates.push(startDate);
      }
      startDate = new Date((startDate.getTime() + millisecondPerDay));
    } while (startDate <= endDate);

    this.loadActiveEventFormData();
    this.oldEventID = this.activeEventF.id.value;
    // console.log(this.oldEventID);
    const timeNow =  new Date();
    timeNow.setHours(0, 0, 0, 0);
    console.log('TimeNow', timeNow);
    if ( this.activeEventF.start < timeNow) {
      this.fillStartTimes({date: new Date(timeNow).setHours(timeNow.getHours() + 1, 0, 0, 0)});
      // this.fillEndTimes({ date: timeNow}, true);
    } else {
      this.fillStartTimes({date: this.activeEventF.start});
      // this.fillEndTimes({ date: this.activeEventF.start}, true);
    }

    console.log('active event:', this.activeEvent);
    // console.log('active event FORM', this.activeEventF);
    // this.bsInlineValue = this.activeEventF.start.value;
    this.bsInlineValue = new Date();
    this.rescheduleEventModal.show();
  }

  onRescheduleDayChange(ev: Date) {

    // console.log('reschedule date changed:', ev);
    if (this.isTheSameDay(ev, new Date())) {
      this.fillStartTimes({date: ev});
      // this.fillEndTimes({ date: ev}, true);
      this.endTimes = [];
      this.endTimes = [new Date(ev.getTime() + this.sessionDuration * 600 * 100)];
    } else {
      this.fillStartTimes({date: new Date(ev.setHours(0, 0, 0, 0))});
      this.endTimes = [];
      this.endTimes = [new Date(ev.getTime() + this.sessionDuration * 600 * 100)];
    }
    // ev.setHours(0, 0, 0, 0);
    // this.fillStartTimes({date: ev});
  }

  onRescheduleEventModalClose() {
    this.isReschedulingMode = false;
    this.rescheduleEventModal.hide();
    this.activeEvent = null;
    this.activeEventForm.patchValue({
      id: null,
      start: null,
      end: null,
      draggable: false,
      cssClass:  null,
      description: null,
      reserved: false,
      reservedById: null,
    });
    this.activeEvent = null;
  }

  onMarkSessionComplete() {
    this.eventDetailModal.hide();
    const clientId = this.activeEvent.client ? this.activeEvent.client : this.activeEvent.orderedById;
    const programId = this.activeEvent.type === 'discovery' ? 'discovery' : this.activeEvent.program;

    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        modal: 'complete',
        coachId: this.userId,
        clientId,
        programId,
        sessionId: this.activeEvent.id,
        eventType: this.activeEvent.type
      } as SessionManagerConfig
    };
    this.bsModalRef = this.modalService.show(SessionManagerComponent, config);
  }

  onViewPerson() {
    this.eventDetailModal.hide();
    this.router.navigate(['/person-history', this.activeEvent.client]);
  }

  onChangeStartTimeHandler(event: any) {
    console.log('Event', event,
      'Times changed', event.target.value );
    this.fillEndTimes({date: new Date(Date.parse(event.target.value))});
    if (this.isReschedulingMode) {
      this.endTimes = [new Date(new Date (Date.parse(event.target.value)).getTime() + this.sessionDuration * 600 * 100)];
    }

  }

  fillStartTimes(event: any) {
    // console.log('eventetete', event);
    this.startTimes = [];
    // console.log('EVENT', event);
    let oldTime: Date = event.date instanceof Date ? event.date : event.date.value ;
    if (this.isReschedulingMode) {
      oldTime.setHours(oldTime.getHours() + 1, 0, 0, 0);
    }
    let newTime = new Date(oldTime);
    if (this.isReschedulingMode) {
      newTime.setHours(newTime.getHours() + 1, 0, 0, 0);
      // console.log('newwTime is', newTime);
    }
    this.startTimes = [oldTime, ...this.startTimes];
    let isOneDay = true;
    while ( isOneDay ) {
      // newTime = new Date(newTime.setMinutes(newTime.getMinutes() + this.sessionDuration));
      newTime = new Date(newTime.getTime() + this.sessionDuration * 60000);
      // console.log(newTime + '\n');
      if (newTime.getDay() !== oldTime.getDay()) {
        console.log('BREAKED');
        isOneDay = false;
      }
      this.startTimes =  [...this.startTimes, newTime ];
    }
    // console.log('This,startTimes', this.startTimes);
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
