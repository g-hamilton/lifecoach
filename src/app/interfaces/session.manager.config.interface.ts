export interface SessionManagerConfig {
    modal: 'complete' | 'edit';
    coachId: string;
    clientId: string;
    programId: string; // will either be 'discovery' or the program ID string
    sessionId: string;
    eventType: 'discovery' | 'session';
}
