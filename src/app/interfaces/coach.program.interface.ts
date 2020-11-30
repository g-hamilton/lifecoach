import { AdminProgramReviewRequest } from './admin.program.review.interface';

export interface CoachingProgram {
    programId: string;
    title: string;
    sellerUid: string;
    image?: string;
    reviewRequest?: AdminProgramReviewRequest;
    subtitle?: string;
    pricingStrategy?: 'flexible' | 'full';
    fullPrice?: number;
    pricePerSession?: number;
    currency?: string;
    stripeId?: string;
    numSessions?: number; // number of sessions in a program
    duration?: number; // in weeks
}
