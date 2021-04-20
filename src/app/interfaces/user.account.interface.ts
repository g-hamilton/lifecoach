/*
    Notes:

    AccountType

    Regular = Users looking for coaching (coachees / students / clients of coaches)
    Coach = Users who provide coaching products and services on the platform
    Partner = Users who want to promote coaching services / the platform to audiences (promotional partners)
    Provider = Users who want to promote their services to Coaches on the platform
    Admin = Platform admins (be careful!)
*/

export interface UserAccount {
    accountType: 'regular' | 'coach' | 'partner' | 'provider' | 'admin';
    firstName?: string;
    lastName?: string;
    uid?: string; // on first registration we can pass the uid to create the account node in the db
    accountEmail?: string; //  set server side on first create
    dateCreated?: Date; // set server side on first create
    stripeUid?: string; // Deprecated! if the user has a Stripe connect EXPRESS account
    stripeAccountId?: string; // If the user has a Stripe Connect STANDARD account (replaces Express flow)
    stripeRequirementsCurrentlyDue?: string; // if Stripe needs user action to ensure unrestricted operation
    stripeCustomerId?: string; // the customer id of the user if they have been created in Stripe
    stripeCustomerLink?: string; // the url for the customer's stripe dashboard
    plan?: 'trial' | 'spark' | 'flame' | 'blaze'; // if registering coach - billing plan
    sessionDuration?: number;
    breakDuration?: number;
}
