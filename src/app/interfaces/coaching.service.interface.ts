export interface CoachingService {
    id: string;
    title: string;
    subtitle: string;
    duration: number;
    serviceType: 'zoom';
    pricingStrategy: 'free' | 'paid';
    image: string;
    price?: number; // if paid strategy
    currency: string; // if paid strategy
}
