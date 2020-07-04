import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarView, CalendarEvent } from 'angular-calendar';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomCalendarEvent } from '../../interfaces/custom.calendar.event.interface';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  @ViewChild('eventDetailModal', { static: false }) public eventDetailModal: ModalDirective;
  @ViewChild('editEventModal', { static: false }) public editEventModal: ModalDirective;

  public view: CalendarView = CalendarView.Month;
  public viewDate: Date = new Date();
  public daysInWeek = 7;
  public refresh: Subject<any> = new Subject(); // allows us to refresh the view when data changes
  public activeEvent: CustomCalendarEvent;
  public activeEventForm: FormGroup;

  public events: CustomCalendarEvent[] = [
    {
      title: 'Click me',
      start: new Date(),
      cssClass: 'custom-event-class',
      draggable: true
    },
    {
      title: 'Or click me',
      start: new Date(),
      cssClass: 'custom-event-class',
      draggable: true
    },
  ];

  constructor(
    public formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.buildActiveEventForm();
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

  loadActiveEventFormData() {
    this.activeEventForm.patchValue({
      id: this.activeEvent.id,
      title: this.activeEvent.title,
      start: this.activeEvent.start ? this.activeEvent.start : new Date(),
      end: this.activeEvent.end,
      draggable: this.activeEvent.draggable ? this.activeEvent.draggable : true,
      cssClass: this.activeEvent.cssClass,
      description: this.activeEvent.description
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
    this.activeEvent = null;
    console.log(this.activeEventForm.value);
    this.activeEventForm.reset();
    this.editEventModal.hide();
  }

}
