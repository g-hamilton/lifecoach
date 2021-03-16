export interface SearchCoachesRequest {
    hitsPerPage: number;
    page: number;
    q?: string; // search query
    goals?: string[];
    challenges?: string[];
    category?: string;
    country?: string;
    city?: string;
    accountType?: 'regular' | 'coach' | 'partner' | 'provider' | 'admin';
    gender?: 'female' | 'male' | 'gnc' | 'prefer-not';
    showCertified?: string;
    icf?: string;
    emcc?: string;
    ac?: string;
    foundation?: string;
    experienced?: string;
    master?: string;
}
