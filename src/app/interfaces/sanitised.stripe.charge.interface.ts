import Stripe from 'stripe';

export interface SanitisedStripeCharge {
    id: string;
    object: string;
    amount: number;
    amount_captured: number;
    amount_refunded: number;
    balance_transaction: string;
    balance_transaction_expanded: Stripe.BalanceTransaction;
    created: number;
    currency: string;
    metadata: any;
    payment_intent: string;
    payment_method: string;
    refunded: boolean;
    refunds: any;
    transfer: any;
    transfer_data: any;
    transfer_group: string;
}
