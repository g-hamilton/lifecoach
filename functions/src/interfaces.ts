/*
    STRIPE INTERFACES
*/

import Stripe from 'stripe';

export interface CustomerData {
  metadata: {
    firebaseUID: string;
  };
  email?: string;
}

export interface Price {
  /**
   * Whether the price can be used for new purchases.
   */
  active: boolean;
  currency: string;
  unit_amount: number | null;
  /**
   * A brief description of the price.
   */
  description: string | null;
  /**
   * One of `one_time` or `recurring` depending on whether the price is for a one-time purchase or a recurring (subscription) purchase.
   */
  type: 'one_time' | 'recurring';
  /**
   * The frequency at which a subscription is billed. One of `day`, `week`, `month` or `year`.
   */
  interval: 'day' | 'month' | 'week' | 'year' | null;
  /**
   * The number of intervals (specified in the `interval` attribute) between subscription billings. For example, `interval=month` and `interval_count=3` bills every 3 months.
   */
  interval_count: number | null;
  /**
   * Default number of trial days when subscribing a customer to this price using [`trial_from_plan=true`](https://stripe.com/docs/api#create_subscription-trial_from_plan).
   */
  trial_period_days: number | null;
  /**
   * Any additional properties
   */
  [propName: string]: any;
}

export interface Product {
  /**
   * Whether the product is currently available for purchase.
   */
  active: boolean;
  /**
   * The product's name, meant to be displayable to the customer. Whenever this product is sold via a subscription, name will show up on associated invoice line item descriptions.
   */
  name: string;
  /**
   * The product's description, meant to be displayable to the customer. Use this field to optionally store a long form explanation of the product being sold for your own rendering purposes.
   */
  description: string | null;
  /**
   * The role that will be assigned to the user if they are subscribed to this plan.
   */
  role: string | null;
  /**
   * A list of up to 8 URLs of images for this product, meant to be displayable to the customer.
   */
  images: Array<string>;
  /**
   * A list of Prices for this billing product.
   */
  prices?: Array<Price>;
  /**
   * Any additional properties
   */
  [propName: string]: any;
}

export interface TaxRate extends Stripe.TaxRate {
  /**
   * Any additional properties
   */
  [propName: string]: any;
}

export interface Subscription {
  /**
   * Set of key-value pairs that you can attach to an object.
   * This can be useful for storing additional information about the object in a structured format.
   */
  id: string;
  name: string;
  metadata: {
    [name: string]: string;
  };
  stripeLink: string;
  role: string | null;
  quantity: number | null;
  items: Stripe.SubscriptionItem[];
  /**
   * Firestore reference to the product doc for this Subscription.
   */
  product: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
  /**
   * Firestore reference to the price for this Subscription.
   */
  price: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
  /**
   * Array of price references. If you prvoide multiple recurring prices to the checkout session via the `line_items` parameter,
   * this array will hold the references for all recurring prices for this subscription. `price === prices[0]`.
   */
  prices: Array<
    FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
  >;
  /**
   * The status of the subscription object
   */
  status:
    | 'active'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'past_due'
    | 'trialing'
    | 'unpaid';
  /**
   * If true the subscription has been canceled by the user and will be deleted at the end of the billing period.
   */
  cancel_at_period_end: boolean;
  /**
   * Time at which the object was created.
   */
  created: FirebaseFirestore.Timestamp;
  /**
   * Start of the current period that the subscription has been invoiced for.
   */
  current_period_start: FirebaseFirestore.Timestamp;
  /**
   * End of the current period that the subscription has been invoiced for. At the end of this period, a new invoice will be created.
   */
  current_period_end: FirebaseFirestore.Timestamp;
  /**
   * If the subscription has ended, the timestamp of the date the subscription ended.
   */
  ended_at: FirebaseFirestore.Timestamp | null;
  /**
   * A date in the future at which the subscription will automatically get canceled.
   */
  cancel_at: FirebaseFirestore.Timestamp | null;
  /**
   * If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with `cancel_at_period_end`, `canceled_at` will still reflect the date of the initial cancellation request, not the end of the subscription period when the subscription is automatically moved to a canceled state.
   */
  canceled_at: FirebaseFirestore.Timestamp | null;
  /**
   * If the subscription has a trial, the beginning of that trial.
   */
  trial_start: FirebaseFirestore.Timestamp | null;
  /**
   * If the subscription has a trial, the end of that trial.
   */
  trial_end: FirebaseFirestore.Timestamp | null;
}

export interface CustomTransfer extends Stripe.Transfer {
    source_transaction_expanded: any; // will be a santised Stripe.Charge object
    balance_transaction_expanded: Stripe.BalanceTransaction;
}

export interface CheckoutSessionRequest {
  product: any;
  uid: string;
  successUrl: string;
  cancelUrl: string;
  partnerReferred: string | null;
  saleItemType: 'coach_subscription';
}

export interface CompleteStripeConnectRequest {
  uid: string;
  returnUrl: string;
  refreshUrl: string;
  type: 'account_onboarding';
  email: string;
  firstName: string;
  lastName: string;
}

/*
    END OF STRIPE INTERFACES
*/

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
