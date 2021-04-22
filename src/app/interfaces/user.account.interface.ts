/*
    Notes:

    AccountType

    Regular = Users looking for coaching (coachees / students / clients of coaches)
    Coach = Users who provide coaching products and services on the platform
    Partner = Users who want to promote lifecoach to coaches for commission
    Provider = Users who want to promote their services to Coaches on the platform
    Admin = Platform admins (be careful!)
*/

import Stripe from 'stripe';

export interface UserAccount {
    accountType: 'regular' | 'coach' | 'partner' | 'provider' | 'admin';
    firstName?: string;
    lastName?: string;
    uid?: string; // on first registration we can pass the uid to create the account node in the db
    accountEmail?: string; //  set server side on first create
    dateCreated?: Date; // set server side on first create
    stripeAccountId?: string; // if the user has a Stripe Connect STANDARD account
    stripeAccount?: Stripe.Account; // should be kept in sync using the stripe account.updated connected webhook
    stripeCustomerId?: string; // the customer id of the user if they have been created in Stripe
    stripeCustomerLink?: string; // the url for the customer's stripe dashboard
    plan?: 'trial' | 'spark' | 'flame' | 'blaze'; // if registering coach - billing plan
    sessionDuration?: number;
    breakDuration?: number;
    stripeUid?: string; // DEPRECATED
}
