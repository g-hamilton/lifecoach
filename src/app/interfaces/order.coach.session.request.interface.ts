import { CustomCalendarEvent } from './custom.calendar.event.interface';

export interface OrderCoachSessionRequest {
    coachId: string; // the id of the coach
    event: CustomCalendarEvent; // the original calendar event object
    uid: string; // the user id of the person booking
    userName: string; // the user name of the person booking
    userPhoto: string; // the photo of the person booking
}
