import { EmojiCountry } from './emoji.country.interface';
import {UserAvatarImagePaths} from './image-path.interface';

export interface AlgoliaCoachProfile {
    city: string;
    country: EmojiCountry;
    speciality1: { id: string, itemName: string };
    proSummary:	string;
    goalTags: { display: string, value: string }[];
    objectID: string;
    dateCreated: number; // unix timestamp
    firstName: string;
    lastName: string;
    email: string;
    phone: number;
    photo: string;
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
    profileVideo: string;
    avatarImagePaths: UserAvatarImagePaths;
}
