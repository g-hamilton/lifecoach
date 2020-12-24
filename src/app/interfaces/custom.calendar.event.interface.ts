import { CalendarEvent } from 'angular-calendar';

export interface CustomCalendarEvent extends CalendarEvent {
    type: 'discovery';
    description?: string;
    reserved?: boolean;
    reservedById?: string | null;
    ordered?: boolean;
    orderedById?: string | null;
}
