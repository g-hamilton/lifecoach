export interface RefundRequest {
    uid: string; // requester's Lifecoach UID
    paymentIntent: any; // will be a 'Stripe.PaymentIntent'
    formData: any;
}
