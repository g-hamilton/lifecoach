import { EmojiCountry } from './emoji.country.interface';

export interface CoachProfile {
    city: string;
    country: EmojiCountry;
    dateCreated: number; // unix timestamp
    email: string;
    firstName: string;
    goalTags: { display: string, value: string }[];
    isPublic: boolean;
    lastName: string;
    phone: number;
    photo: string;
    proSummary:	string;
    objectID: string;
    qualBa:	boolean;
    qualBsc: boolean;
    qualBcomm: boolean;
    qualMa: boolean;
    qualMs: boolean;
    qualMba: boolean;
    qualMapp: boolean;
    qualPhd: boolean;
    qualAcc: boolean;
    qualPcc: boolean;
    qualMcc: boolean;
    qualOther: boolean;
    qualEia: boolean;
    qualEqa: boolean;
    qualEsia: boolean;
    qualEsqa: boolean;
    qualIsmcp: boolean;
    qualApecs: boolean;
    qualEcas: boolean;
    qualCas: boolean;
    qualCsa: boolean;
    qualSa: boolean;
    speciality1: { id: string, itemName: string };
    profileUrl?: string;
    shortUrl?: string;
    fullDescription?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
    website?: string;
    selectedProfileVideo?: string;
}
