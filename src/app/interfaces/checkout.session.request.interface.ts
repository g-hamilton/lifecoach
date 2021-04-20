export interface CheckoutSessionRequest {
    product: any;
    uid: string;
    successUrl: string;
    cancelUrl: string;
    partnerReferred: string | null;
    saleItemType: 'coach_subscription';
}
