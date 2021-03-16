import { EmojiCountry } from './emoji.country.interface';
import {UserAvatarImagePaths} from './image-path.interface';

export interface CoachProfile {
    city: string;
    country: EmojiCountry;
    dateCreated: number; // unix timestamp
    email: string;
    firstName: string;
    isPublic: boolean;
    lastName: string;
    gender: 'female' | 'male' | 'gnc' | 'prefer-not';
    photo: string;
    proSummary:	string;
    objectID: string;
    // ICF
    qualAcc: boolean;
    qualPcc: boolean;
    qualMcc: boolean;
    // EMCC
    qualEmccFoundation: boolean;
    qualEmccPractitioner: boolean;
    qualEmccSeniorPractitioner: boolean;
    qualEmccMasterPractitioner: boolean;
    // AC
    qualAcFoundation: boolean;
    qualAcCoach: boolean;
    qualAcProfessionalCoach: boolean;
    qualAcMasterCoach: boolean;
    // APECS
    qualApecsAssociate: boolean;
    qualApecsProfessional: boolean;
    qualApecsMaster: boolean;
    speciality1: { id: string, itemName: string };
    goalTags?: { display: string, value: string }[];
    credentials?: { display: string, value: string }[];
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
    photoPaths?: UserAvatarImagePaths;
    includeInCoachingForCoaches?: boolean;
    onlyIncludeInCoachingForCoaches?: boolean;
    targetIssues?: string;
    targetGoals?: string;
    phone?: number;
}
