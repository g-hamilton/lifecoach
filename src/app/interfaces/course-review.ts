export interface CourseReview {
    reviewerUid: string;
    reviewerFirstName: string;
    reviewerLastName: string;
    sellerUid: string;
    courseId: string;
    starValue: number;
    lastUpdated: number; // unix timestamp
    summary?: string;
    summaryExists?: boolean; // set true if review includes summary text
    reviewerPhoto?: string;
}
