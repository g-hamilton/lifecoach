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

    // ICF
    qualAcc?: boolean;
    qualPcc?: boolean;
    qualMcc?: boolean;
    // EMCC
    qualEmccFoundation?: boolean;
    qualEmccPractitioner?: boolean;
    qualEmccSeniorPractitioner?: boolean;
    qualEmccMasterPractitioner?: boolean;
    // AC
    qualAcFoundation?: boolean;
    qualAcCoach?: boolean;
    qualAcProfessionalCoach?: boolean;
    qualAcMasterCoach?: boolean;
    // APECS
    qualApecsAssociate?: boolean;
    qualApecsProfessional?: boolean;
    qualApecsMaster?: boolean;
    profileVideo: string;
    photoPaths: UserAvatarImagePaths;
}
