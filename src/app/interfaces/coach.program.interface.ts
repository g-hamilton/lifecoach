import { AdminProgramReviewRequest } from './admin.program.review.interface';

export interface CoachingProgram {
    programId: string;
    title: string;
    sellerUid: string;
    reviewRequest?: AdminProgramReviewRequest;
    subtitle?: string;
    pricingStrategy?: 'flexible' | 'full';
    fullPrice?: number;
    pricePerSession?: number;
    currency?: string;
    stripeId?: string;
    numSessions?: number; // number of sessions in a program
    duration?: number; // in weeks
    description?: string;
    language?: string;
    category?: string;
    level?: string;
    subject?: string;
    image?: string;
    promoVideo?: any;
    learningPoints?: string[];
    requirements?: string[];
    targets?: string[];
    coachName?: string;
    coachPhoto?: string;
    isTest?: boolean;
    lastUpdated?: number; // unix timestamp
}
