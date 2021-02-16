/*
    This is a custom interface that defines the data required to pass a valid request object
    when calling for a Stripe Payment Intent
*/

export interface StripePaymentIntentRequest {
    saleItemId: string; // can be a 'serviceId', 'courseId' or 'programId'
    saleItemType: 'ecourse' | 'fullProgram' | 'programSession' | 'coachingPackage';
    salePrice: number;
    currency: string;
    buyerUid: string; // the Lifecoach UID of the purchaser
    referralCode?: string; // optional. if a referral / tracking code is used to make the purchase
    pricingSessions?: number; // optional. if purchasing a coaching service package, how many sessions (which package) is being purchased?
    partnerTrackingCode?: string; // optional. if a promo partner has referred the user to the app within the valid time period
}
