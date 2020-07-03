import { CoachingCourseVideo } from './course.interface';

export interface AlgoliaPublishedCourse {
    objectID: string;
    approved: number; // unix timestamp
    title: string;
    subtitle: string;
    category: string;
    subject: string;
    isTest: boolean;
    language: string;
    level: string;
    pricingStrategy: string;
    price: number;
    currency: string;
    image: string;
    promoVideo: CoachingCourseVideo;
    coachName: string;
    coachPhoto: string;
    includeInCoachingForCoaches?: boolean;
}
