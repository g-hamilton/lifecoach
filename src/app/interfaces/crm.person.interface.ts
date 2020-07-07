export interface CRMPerson {
    created: Date;
    type: 'warm lead' | 'lead' | 'client';
    firstName: string;
    lastName: string;
    email: string;
    photo: string;
    status: any;
    history?: any;
}
