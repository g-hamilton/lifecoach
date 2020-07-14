export interface CoachingService {
    id: string;
    coachUid: string;
    title: string;
    subtitle: string;
    duration: number;
    serviceType: 'zoom';
    pricingStrategy: 'free' | 'paid';
    image: string;
    description: string;
    price?: number; // if paid strategy
    currency?: string; // if paid strategy
}
