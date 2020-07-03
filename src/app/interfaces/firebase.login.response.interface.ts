export interface FirebaseLoginResponse {
    result?: {
        user: {
            email?: string;
            uid?: string;
            emailVerified?: boolean;
            // If coming from Facebook Auth, we may also get these:
            id?: string // FB UID. not ours.
            name?: string;
            first_name?: string;
            last_name?: string;
            avatar?: string;
        }
        method?: 'Facebook' | null
    };
    error?: {
        code?: string;
        message?: string;
    };
  }
