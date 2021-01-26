export interface ServiceReview {
    reviewerUid: string;
    reviewerFirstName: string;
    reviewerLastName: string;
    sellerUid: string;
    serviceId: string;
    starValue: number;
    lastUpdated: number; // unix timestamp
    summary?: string;
    summaryExists?: boolean; // set true if review includes summary text
    reviewerPhoto?: string;
}
