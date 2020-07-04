import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarView } from 'angular-calendar';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomCalendarEvent } from '../../interfaces/custom.calendar.event.interface';
import { DataService } from 'app/services/data.service';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  @ViewChild('eventDetailModal', { static: false }) public eventDetailModal: ModalDirective;
  @ViewChild('editEventModal', { static: false }) public editEventModal: ModalDirective;

  private userId: string;

  public view: CalendarView = CalendarView.Month;
  public viewDate: Date = new Date();
  public daysInWeek = 7;
  public refresh: Subject<any> = new Subject(); // allows us to refresh the view when data changes
  public activeEvent: CustomCalendarEvent;
  public activeEventForm: FormGroup;
  public savingEvent: boolean;

  public events: CustomCalendarEvent[];

  constructor(
    private authService: AuthService,
    public formBuilder: FormBuilder,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.buildActiveEventForm();
    this.loadUserData();
    this.doStuff();
  }

  buildActiveEventForm() {
    this.activeEventForm = this.formBuilder.group(
      {
        id: [null],
        title: [null],
        start: [null],
        end: [null],
        draggable: [null],
        cssClass: [null],
        description: [null]
      }
    );
  }

  get activeEventF(): any {
    return this.activeEventForm.controls;
  }

  loadUserData() {
    this.authService.getAuthUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.dataService.getUserCalendarEvents(this.userId).subscribe(events => {
          if (events) {

            // important: update date objects as Firebase stores dates as unix string: 't {seconds: 0, nanoseconds: 0}'
            events.forEach((ev: any) => {
              if (ev.start) {
                ev.start = new Date(ev.start.seconds * 1000);
              }
              if (ev.end) {
                ev.end = new Date(ev.end.seconds * 1000);
              }
            });

            this.events = events;
            console.log(this.events);
          }
        });
      }
    });
  }

  loadActiveEventFormData() {
    this.activeEventForm.patchValue({
      id: this.activeEvent.id ? this.activeEvent.id : null,
      title: this.activeEvent.title ? this.activeEvent.title : null,
      start: this.activeEvent.start ? this.activeEvent.start : new Date(),
      end: this.activeEvent.end ? this.activeEvent.end : null,
      draggable: this.activeEvent.draggable ? this.activeEvent.draggable : true,
      cssClass: this.activeEvent.cssClass ? this.activeEvent.cssClass : null,
      description: this.activeEvent.description ? this.activeEvent.description : null
    });
  }

  doStuff() {
    setTimeout(() => {
      this.events.push({
        title: 'Wow',
        start: new Date(),
        cssClass: 'custom-event-class',
        draggable: true
      });
      this.refresh.next();
    }, 5000);
  }

  onColumnClicked(event: any) {
    console.log('clicked column:', event.isoDayNumber);
  }

  onDayClicked(event: any) {
    // console.log('clicked day:', event.day.date);
    this.createEvent(event.day.date);
  }

  onDayHeaderClicked(event: any) {
    // console.log('clicked day header:', event.day.date);
    this.createEvent(event.day.date);
  }

  onHourSegmentClicked(event: any) {
    // console.log('clicked hour segment:', event.date);
    this.createEvent(event.date);
  }

  createEvent(date: Date) {
    console.log('Create event', date);

    // prepare a new event object
    const newEvent: CustomCalendarEvent = {
      id: Math.random().toString(36).substr(2, 9), // generate semi-random id
      title: 'New Event',
      start: date
    };

    // load the new event as the active event
    this.activeEvent = newEvent;
    this.loadActiveEventFormData();

    // pop the edit event modal
    this.editEventModal.show();
  }

  eventClicked({ event }: { event: CustomCalendarEvent }): void {
    console.log('Event clicked', event);
    this.activeEvent = event;
    this.eventDetailModal.show();
  }

  onEventDetailModalClose() {
    this.eventDetailModal.hide();
    this.activeEvent = null;
  }

  onEditEventModalClose() {
    this.editEventModal.hide();
    this.activeEvent = null;
  }

  onEditEvent() {
    this.eventDetailModal.hide();
    this.loadActiveEventFormData();
    this.editEventModal.show();
  }

  onDeleteEvent() {
    //
  }

  onUpdateEvent() {
    this.savingEvent = true;

    // if the event has no id, create one id now
    if (!this.activeEventF.id.value) {
      this.activeEventForm.patchValue({ id: Math.random().toString(36).substr(2, 9) }); // generate semi-random id
    }

    const ev = this.activeEventForm.value;

    console.log(ev);

    // save the event
    if (!this.userId) {
      alert('No user ID');
      return;
    }
    this.dataService.saveUserCalendarEvent(this.userId, ev);

    // dismiss the modal
    this.editEventModal.hide();

    // reset the active event
    this.activeEvent = null;
    this.activeEventForm.reset();
  }

}
