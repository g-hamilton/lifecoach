export interface CRMPerson {
    id: string; // this person's lifecoach uid
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
    id: string;
    roomId: string;
}
