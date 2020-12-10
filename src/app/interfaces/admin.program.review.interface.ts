export interface AdminProgramReviewRequest {
    programId: string;
    sellerUid: string;
    requested: number; // unix timestamp
    status: 'submitted' | 'in-review' | 'approved' | 'rejected';
    id?: string; // db doc id
    approved?: number; // unix timestamp
    rejected?: number; // unix timestamp
    rejectData?: any;
    reviewerUid?: string;
}
