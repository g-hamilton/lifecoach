export interface AlgoliaUserAccount {
    accountEmail: string;
    accountType: 'regular' | 'coach' | 'admin';
    dateCreated: number; // unix timestamp
    firstName: string;
    lastName: string;
    userID:	string;
    objectID: string;
}
