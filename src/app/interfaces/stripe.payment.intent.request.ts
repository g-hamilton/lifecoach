/*
    This is a custom interface that defines the data required to pass a valid request object
    when calling for a Stripe Payment Intent
*/

export interface StripePaymentIntentRequest {
    saleItemId: string; // can be a 'courseId' or 'programId'
    saleItemType: 'ecourse' | 'fullProgram';
    salePrice: number;
    currency: string;
    buyerUid: string; // the Lifecoach UID of the purchaser
    referralCode?: string; // optional. if a referral / tracking code is used to make the purchase
}
