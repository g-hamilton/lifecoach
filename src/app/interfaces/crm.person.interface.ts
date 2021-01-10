export interface CRMPerson {
    id: string; // will be this person's lifecoach uid as well as the db record id
    created: Date;
    type: 'warm lead' | 'lead' | 'client';
    firstName: string;
    lastName: string;
    email: string;
    photo: string;
    status: 'Awaiting reply' | 'Client responded' | 'Responded' | 'Enrolled in self-study course' | 'In Discovery' |
    'Cancelled Session' | 'Enrolled in program';
    history?: CRMPersonHistoryEvent[];
    lastReplyReceived?: string; // should be a unix string if this person has sent a reply after sending initial chat msg
    enrolledPrograms?: EnrolledProgram[]; // can contain an array of program ids that this person has enrolled in
}

export interface CRMPersonHistoryEvent {
    action: 'sent_first_message' | 'enrolled_in_self_study_course' | 'enrolled_in_full_program' | 'enrolled_in_program_session' |
    'coach_invited_user' | 'booked_session' | 'cancelled_session' | 'completed_session' | 'coach_created_session';
    id: string; // will be the db record which is also a unix timestamp doc id - NOT the person's lifecoach uid
    roomId?: string; // if the action relates to a message
    courseId?: string; // if this action relates to an eCourse
    programId?: string; // if this action relates to a program
    event?: CRMPersonHistoryEventData;
}

export interface CRMPersonHistoryEventData {
    name?: string;
    properties?: any; // will be an object containing custom properties
    type?: 'discovery' | 'session';
    id?: string;
}

export interface EnrolledProgram {
    id: string;
    purchasedSessions?: number; // how many sessions the user has purchased (remaining) in the program
    title?: string; // the program title
}
