export interface UserAccount {
    accountEmail: string;
    accountType: 'regular' | 'coach';
    password?: string; // Only on first creation
    firstName?: string;
    lastName?: string;
    dateCreated?: Date;
    stripeUid?: string; // if the user has a Stripe connected account
    stripeRequirementsCurrentlyDue?: string; // if Stripe needs user action to ensure unrestricted operation
    creatorDealsProgram?: boolean; // for coaches who are course creators to opt into the deals program
    creatorExtendedPromotionsProgram?: boolean; // for coaches who are course creators to opt into the extended promotions program
}
