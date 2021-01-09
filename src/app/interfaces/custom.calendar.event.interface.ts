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
    sessionId?: string; // session ID should always match the event id
    cancelled?: boolean; // has the event been cancelled?
    cancelledTime?: number;
    cancelledById?: string; // id of the user who cancelled the event
    complete?: boolean; // if event is marked complete by coach
    completedTime?: number; // unix timestamp in seconds if event is marked complete by coach
    client?: string; // can contain a client uid if coach is booking a client session
    program?: string; // can contain a program id if the event is related to a program session
}
