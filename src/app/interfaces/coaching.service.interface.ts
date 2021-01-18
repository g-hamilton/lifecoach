import { AdminProgramReviewRequest } from './admin.program.review.interface';
import { ProgramImagePaths } from './image-path.interface';

export interface CoachingService {
    serviceId: string;
    title: string;
    sellerUid: string;
    reviewRequest?: AdminProgramReviewRequest;
    subtitle?: string;
    pricePerSession?: number;
    currency?: string;
    stripeId?: string;
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
    monthlyEarnings?: any;
    lifetimeTotals?: any;
    lifetimeTotalSales?: number;
    totalFiveStarReviews?: number;
    totalFourPointFiveStarReviews?: number;
    totalFourStarReviews?: number;
    totalThreePointFiveStarReviews?: number;
    totalThreeStarReviews?: number;
    totalTwoPointFiveStarReviews?: number;
    totalTwoStarReviews?: number;
    totalOnePointFiveStarReviews?: number;
    totalOneStarReviews?: number;
    totalZeroPointFiveStarReviews?: number;
    totalZeroStarReviews?: number;
    adminApproved?: boolean;
    approved?: number; // unix timestamp
    progress?: number;
    purchasedSessions?: any[];
    sessionsComplete?: any[];
    imagePaths?: ProgramImagePaths;
    // for different image to speed up first render --test_feature
}
