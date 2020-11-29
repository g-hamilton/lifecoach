import { AdminProgramReviewRequest } from './admin.program.review.interface';

export interface CoachingProgram {
    programId: string;
    title: string;
    sellerUid: string;
    image?: string;
    reviewRequest?: AdminProgramReviewRequest;
    subtitle?: string;
}
