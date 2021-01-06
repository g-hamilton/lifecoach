import { CalendarEvent } from 'angular-calendar';

export interface CustomCalendarEvent extends CalendarEvent {
    id: string;
    type: 'discovery' | 'session';
    description?: string;
    reserved?: boolean;
    reservedById?: string | null;
    ordered?: boolean;
    orderedById?: string | null;
    orderedByName?: string;
    orderedByPhoto?: string;
    sessionId?: string;
    cancelled?: boolean;
    cancelledTime?: number;
    cancelledById?: string;
    client?: string; // can contain a client uid if coach is booking a client session
    program?: string; // can contain a program id if the event is related to a program session
}
