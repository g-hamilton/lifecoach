import { CalendarEvent } from 'angular-calendar';

export interface CustomCalendarEvent extends CalendarEvent {
    id: string;
    type: 'discovery';
    description?: string;
    reserved?: boolean;
    reservedById?: string | null;
    ordered?: boolean;
    orderedById?: string | null;
    orderedByName?: string;
    orderedByPhoto?: string;
    sessionId?: string;
}
