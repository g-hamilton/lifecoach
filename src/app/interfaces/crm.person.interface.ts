export interface CRMPerson {
    id: string; // will be this person's lifecoach uid as well as the db record id
    created: Date;
    type: 'warm lead' | 'lead' | 'client';
    firstName: string;
    lastName: string;
    email: string;
    photo: string;
    status: 'Awaiting reply' | 'Client responded' | 'Responded' | 'Enrolled in self-study course';
    history?: CRMPersonHistoryEvent[];
    lastReplyReceived?: string; // should be a unix string if this person has sent a reply after sending initial chat msg
}

export interface CRMPersonHistoryEvent {
    action: 'sent_first_message' | 'enrolled_in_self_study_course';
    id: string; // will be the db record which is also a unix timestamp - NOT the person's lifecoach uid
    roomId?: string; // if the action relates to a message
    courseId?: string; // if this action relates to an eCourse
    programId?: string; // if this action relates to a program
}
