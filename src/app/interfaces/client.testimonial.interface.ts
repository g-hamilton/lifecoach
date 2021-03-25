export interface ClientTestimonial {
    id: string; // the id of the testimonial doc
    created: number; // timestamp when doc created
    clientUid: string; // the uid of the client
    coachUid: string; // the uid of the coach
    firstName: string; // client first name
    lastName: string; // client last name
    description: string; // the testimonial text
    img?: string; // path to avatar if one exists
}
