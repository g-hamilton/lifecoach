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
    accountEmail: string;
    accountType: 'regular' | 'coach' | 'partner' | 'provider' | 'admin';
    password?: string; // Only on first creation
    firstName?: string;
    lastName?: string;
    dateCreated?: Date;
    stripeUid?: string; // if the user has a Stripe connected account
    stripeRequirementsCurrentlyDue?: string; // if Stripe needs user action to ensure unrestricted operation
    creatorDealsProgram?: boolean; // for coaches who are course creators to opt into the deals program
    creatorExtendedPromotionsProgram?: boolean; // for coaches who are course creators to opt into the extended promotions program
    sessionDuration?: number;
    breakDuration?: number;
}
