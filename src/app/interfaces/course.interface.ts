import { AdminCourseReviewRequest } from './admin.course.review';

export interface CoachingCourse {
    courseId: string;
    title: string;
    subtitle: string;
    sellerUid: string;
    description: string;
    language: string;
    category: string;
    level: 'all' | 'beginner' | 'intermediate' | 'advanced';
    subject: string;
    pricingStrategy: 'free' | 'paid';
    stripeId?: string; // only present if pricingStrategy === 'paid'
    coachName?: string;
    coachPhoto?: string;
    image?: string;
    promoVideo?: any;
    learningPoints?: string[];
    requirements?: string[];
    targets?: string[];
    currency?: string;
    price?: number;
    sections?: CoachingCourseSection[]; // all course sections
    lectures?: CoachingCourseLecture[]; // all course lectures
    lifetimeTotalSales?: number;
    lifetimeTotals?: any;
    adminApproved?: boolean;
    approved?: number; // unix timestamp
    reviewRequest?: AdminCourseReviewRequest;
    lastUpdated?: number; // unix timestamp
    monthlyEarnings?: any;
    id?: string;
    progress?: number; // client side only
    questions?: number; // total number of questions asked in this course
    disableInstructorSupport?: boolean;
    disableAllDiscussion?: boolean;
    includeInCoachingForCoaches?: boolean;
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
    isTest?: boolean;
}

export interface CoachingCourseSection {
    id: string;
    title: string;
    expanded?: boolean;
    lectures?: string[]; // lecture ids of only the associated lectures in each section
}

export interface CoachingCourseLecture {
    id: string;
    title: string;
    type: 'Video' | 'Article';
    preview: boolean;
    includeResources: boolean;
    videoId?: string;
    video?: CoachingCourseVideo;
    article?: string;
    resources?: CoachingCourseResource[];
}

export interface CoachingCourseVideo {
    downloadURL: string;
    path: string;
    fileName: string;
    lastModified: number;
    lastUploaded: number;
    duration: number; // in seconds
    id?: string;
}

export interface CoachingCourseResource {
    downloadURL: string;
    path: string;
    fileName: string;
    lastModified: number;
    lastUploaded: number;
    id?: string;
}
