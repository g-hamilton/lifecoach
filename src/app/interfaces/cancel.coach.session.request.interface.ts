import { CustomCalendarEvent } from './custom.calendar.event.interface';

export interface CancelCoachSessionRequest {
    coachId: string;
    event: CustomCalendarEvent;
    cancelledById: string;
}
