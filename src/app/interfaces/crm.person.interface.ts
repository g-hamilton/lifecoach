export interface CRMPerson {
    id: string;
    created: Date;
    type: 'warm lead' | 'lead' | 'client';
    firstName: string;
    lastName: string;
    email: string;
    photo: string;
    status: any;
    history?: any;
    lastReplyReceived?: string; // should be a unix string if this person has sent a reply after sending initial chat msg
}
