export interface SearchCoachesRequest {
    hitsPerPage: number;
    page: number;
    query?: string;
    goals?: string[];
    challenges?: string[];
    category?: string;
    country?: string;
    city?: string;
    accountType?: 'regular' | 'coach' | 'partner' | 'provider' | 'admin';
}
