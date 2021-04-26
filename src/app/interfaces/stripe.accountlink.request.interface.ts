export interface StripeAccountLinkRequest {
    account: string;
    refresh_url: string;
    return_url: string;
    type: 'account_onboarding'
}
