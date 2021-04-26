export interface CompleteStripeConnectRequest {
    uid: string;
    returnUrl: string;
    refreshUrl: string;
    type: 'account_onboarding';
    email: string;
    firstName: string;
    lastName: string;
}
