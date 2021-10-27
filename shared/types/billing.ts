export interface ApiCreateCheckout {
    priceId: string;
    amount?: number;
    trialPeriod?: number;
    mode?: 'subscription' | 'payment';
}