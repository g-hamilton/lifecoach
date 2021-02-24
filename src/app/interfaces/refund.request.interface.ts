import { Stripe } from 'stripe';

export interface RefundRequest {
    uid: string; // requester's Lifecoach UID
    paymentIntent: Stripe.PaymentIntent;
    formData: any;
    id?: string;
    status?: 'requested' | 'refunded';
    refund?: Stripe.Refund;
}
