import { CoachingProgram } from './coach.program.interface';
import { CoachingCourse } from './course.interface';
import { CRMPerson } from './crm.person.interface';

/*
    Note: we don't need the coach's ID or profile here because their sellerUid, name
    and photo etc will be included in the item object.
*/

export interface CoachInvite {
    invitee: CRMPerson;
    type: 'ecourse' | 'program';
    item: CoachingCourse | CoachingProgram;
    message?: string;
}
