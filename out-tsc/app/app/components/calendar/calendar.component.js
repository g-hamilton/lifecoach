var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { CalendarView } from 'angular-calendar';
import { Subject, Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { AuthService } from 'app/services/auth.service';
import { take } from 'rxjs/operators';
let CalendarComponent = class CalendarComponent {
    constructor(authService, formBuilder, dataService) {
        this.authService = authService;
        this.formBuilder = formBuilder;
        this.dataService = dataService;
        this.view = CalendarView.Week;
        this.viewDate = new Date();
        this.daysInWeek = 7;
        this.refresh = new Subject(); // allows us to refresh the view when data changes
        this.sessionDuration = 30;
        this.breakDuration = 15;
        // video conferencing
        this.meetingDomain = 'live.lifecoach.io';
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        this.buildActiveEventForm();
        this.loadUserData();
        this.endTimes = [];
        this.startTimes = [];
        console.log('View', this.viewDate);
    }
    ngAfterViewInit() {
        // this.initJitsiMeet();
    }
    initJitsiMeet() {
        // https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe
        this.meetingOptions = {
            roomName: 'nkbfjksbfksdbfjsbfksb',
            width: 700,
            height: 700,
            parentNode: document.querySelector('#meet'),
        };
        this.meetingApi = new JitsiMeetExternalAPI(this.meetingDomain, this.meetingOptions);
    }
    buildActiveEventForm() {
        this.activeEventForm = this.formBuilder.group({
            id: [null],
            title: [null],
            start: [null],
            end: [null],
            draggable: [null],
            cssClass: [null],
            description: [null]
        });
    }
    get activeEventF() {
        return this.activeEventForm.controls;
    }
    loadUserData() {
        this.subscriptions.add(this.authService.getAuthUser().subscribe(user => {
            if (user) {
                console.log('USER OBJ:', user);
                this.userId = user.uid;
                this.subscriptions.add(this.dataService.getUserAccount(this.userId).pipe(take(1)).subscribe(userAccount => {
                    this.sessionDuration = userAccount.sessionDuration ? userAccount.sessionDuration : 30;
                    this.breakDuration = userAccount.breakDuration ? userAccount.breakDuration : 15;
                }));
                this.subscriptions.add(this.dataService.getUserCalendarEvents(this.userId, this.viewDate).subscribe(events => {
                    if (events) {
                        console.log('events before forEach', events);
                        // important: update date objects as Firebase stores dates as unix string: 't {seconds: 0, nanoseconds: 0}'
                        events.forEach((ev) => {
                            if (ev.start) {
                                ev.start = new Date(ev.start.seconds * 1000);
                            }
                            if (ev.end) {
                                ev.end = new Date(ev.end.seconds * 1000);
                            }
                            ev.title = ev.reserved ? 'RESERVED' : 'FREE';
                        });
                        this.events = events;
                        this.refresh.next(); // refresh the view
                        // console.log(this.events);
                    }
                }));
            }
        }));
    }
    loadActiveEventFormData() {
        this.activeEventForm.patchValue({
            id: this.activeEvent.id ? this.activeEvent.id : null,
            start: this.activeEvent.start ? this.activeEvent.start : null,
            end: this.activeEvent.end ? this.activeEvent.end : null,
            // title: this.activeEvent.start.toLocaleTimeString() + ' - ' + (this.activeEvent.end.toLocaleTimeString() || ' '),
            draggable: false,
            cssClass: this.activeEvent.cssClass ? this.activeEvent.cssClass : null,
            description: this.activeEvent.description ? this.activeEvent.description : null,
            reserved: this.activeEvent.reserved ? this.activeEvent.reserved : false,
            reservedById: this.activeEvent.reservedById ? this.activeEvent.reservedById : null
        });
    }
    onColumnClicked(event) {
        // console.log('clicked column:', event.isoDayNumber);
    }
    onDayClicked(event) {
        // console.log('clicked day:', event.day.date);
        // this.createEvent(event.day.date);
    }
    onDayHeaderClicked(event) {
        // console.log('clicked day header:', event.day.date);
        // this.createEvent(event.day.date);
    }
    onHourSegmentClicked(event) {
        if (event.date < new Date(Date.now() + 60000 * 30)) { // 30 minutes for planning event
            alert('You can`t pick date, which has already been'); // TODO: Modal
            return;
        }
        this.createEvent(event.date);
        this.fillEndTimes(event);
        this.fillStartTimes(event);
    }
    toTimeStampFromStr(strDate) {
        return Date.parse(strDate) / 1000;
    }
    fillEndTimes(event, dontPop) {
        console.log('Event', event.date);
        let date;
        if (event.date !== undefined && event.date.status === undefined) {
            date = event.date instanceof Date ? new Date(event.date) : new Date(this.toTimeStampFromStr(event.target.value) * 1000);
        }
        else {
            date = new Date(event.date.value);
        }
        let newTime = date;
        console.group('test');
        // console.log('EndTimes before cleaning', this.endTimes);
        this.endTimes = [];
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
    createEvent(date) {
        // console.log('Create event', date);
        // prepare a new event object
        const newEvent = {
            id: Math.random().toString(36).substr(2, 9),
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
    eventClicked({ event }) {
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
            cssClass: null,
            description: null,
            reservedById: null,
            reserved: false,
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
            cssClass: null,
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
        this.fillStartTimes({ date: this.activeEventF.start });
        this.fillEndTimes({ date: this.activeEventF.start }, true);
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
        if (this.activeEvent.reserved) {
            alert(`Sorry, this event was already reserved by the user: ${this.activeEvent.reservedById}`); // TODO: Modal
            return;
        }
        this.cancelEventModal.show();
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
    onDeleteEvent(notifyOther) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Cancel event. Notify other(s):', notifyOther);
            // TODO could send notification emails / notifications now
            // delete the event
            yield this.dataService.deleteUserCalendarEvent(this.userId, this.activeEvent.start);
            // dismiss the modal
            this.cancelEventModal.hide();
            // reset the active event
            this.activeEvent = null;
            this.activeEventForm.reset();
        });
    }
    isTheSameDay(a, b) {
        return (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDay() === b.getDay());
    }
    divideEventIntoSessions(ob) {
        console.log('divider', ob);
        const result = [];
        const startTime = new Date(ob.start).getTime();
        const endTime = ob.end.getTime();
        console.log(ob.start, ob.end);
        if (endTime - startTime !== this.sessionDuration * 60000 + this.breakDuration * 60000) {
            let expireTime = startTime;
            console.log('Was divided');
            while (expireTime < endTime) {
                const ev = Object.assign(Object.assign({}, ob), { 
                    // title: `${new Date(expireTime).toLocaleTimeString()} - ${new Date(expireTime + this.sessionDuration * 60000).toLocaleTimeString()}`,
                    title: ob.reservedById ? 'Reserved' : 'I am free', cssClass: ob.reservedById ? 'reserved' : 'not', start: new Date(expireTime), end: new Date(expireTime + this.sessionDuration * 60000), id: Math.random().toString(36).substr(2, 9), reserved: false, reservedById: null });
                console.log(ev);
                result.push(ev);
                expireTime += this.sessionDuration * 60000 + this.breakDuration * 60000;
            }
        }
        else {
            result.push(Object.assign(Object.assign({}, ob), { title: ob.reservedById ? 'Reserved' : 'I am free', cssClass: ob.reservedById ? 'reserved' : 'not', reserved: false, reservedById: null }));
        }
        return result;
    }
    onUpdateEvent() {
        this.savingEvent = true;
        // if the event has no id, create one id now
        if (!this.activeEventF.id.value) {
            this.activeEventForm.patchValue({ id: Math.random().toString(36).substr(2, 9) }); // generate semi-random id
        }
        console.log(this.activeEventF);
        console.log('Events', this.events);
        const ev = this.activeEventForm.value;
        ev.start = new Date(ev.start);
        const thisDayEvents = this.events !== undefined ?
            this.events
                .filter(item => this.isTheSameDay(item.start, ev.start))
            : undefined;
        console.log(thisDayEvents);
        let error = false;
        if (thisDayEvents.length) {
            for (let i = 0; i < thisDayEvents.length; i++) {
                if ((this.toTimeStampFromStr(ev.start) <= this.toTimeStampFromStr(thisDayEvents[i].end.toString())
                    && (this.toTimeStampFromStr(ev.start) >= this.toTimeStampFromStr(thisDayEvents[i].start.toString())))
                    || (this.toTimeStampFromStr(ev.end) >= this.toTimeStampFromStr(thisDayEvents[i].start.toString()))
                        && (this.toTimeStampFromStr(ev.end) <= this.toTimeStampFromStr(thisDayEvents[i].end.toString()))) {
                    error = true;
                }
            }
        }
        if (error) {
            // TODO: It will be better to do a Modal with warning;
            alert('Choose other date!'); // TODO: Modal
            return;
        }
        // Make a divider there
        //
        // ev.title = `${ev.start.toLocaleTimeString()} - ${ev.end.toLocaleTimeString()}`;
        this.divideEventIntoSessions(ev)
            .forEach(i => this.dataService.saveUserCalendarEvent(this.userId, i.start, i));
        console.log(ev);
        // save the event
        if (!this.userId) {
            alert('No user ID'); // TODO: Modal
            return;
        }
        // this.dataService.saveUserCalendarEvent(this.userId, ev.start, ev);
        // dismiss the modal
        this.editEventModal.hide();
        // reset the active event
        this.activeEvent = null;
        this.activeEventForm.reset();
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
    onChangeStartTimeHandler(event) {
        console.log('Event', event, 'Times changed', event.target.value);
        this.fillEndTimes({ date: new Date(Date.parse(event.target.value)) });
    }
    fillStartTimes(event) {
        this.startTimes = [];
        const oldTime = event.date instanceof Date ? event.date : event.date.value;
        let newTime = new Date(oldTime);
        this.startTimes = [...this.startTimes, oldTime];
        while (true) {
            newTime = new Date(newTime.setMinutes(newTime.getMinutes() + this.sessionDuration));
            if (newTime.getDay() !== oldTime.getDay()) {
                break;
            }
            this.startTimes = [...this.startTimes, newTime];
        }
        this.activeEventForm.patchValue({
            start: this.startTimes[0]
        });
    }
};
__decorate([
    ViewChild('eventDetailModal', { static: false }),
    __metadata("design:type", ModalDirective)
], CalendarComponent.prototype, "eventDetailModal", void 0);
__decorate([
    ViewChild('editEventModal', { static: false }),
    __metadata("design:type", ModalDirective)
], CalendarComponent.prototype, "editEventModal", void 0);
__decorate([
    ViewChild('cancelEventModal', { static: false }),
    __metadata("design:type", ModalDirective)
], CalendarComponent.prototype, "cancelEventModal", void 0);
CalendarComponent = __decorate([
    Component({
        selector: 'app-calendar',
        encapsulation: ViewEncapsulation.None,
        templateUrl: './calendar.component.html',
    }),
    __metadata("design:paramtypes", [AuthService,
        FormBuilder,
        DataService])
], CalendarComponent);
export { CalendarComponent };
//# sourceMappingURL=calendar.component.js.map