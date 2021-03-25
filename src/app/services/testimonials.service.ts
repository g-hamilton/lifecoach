import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ClientTestimonial } from '../interfaces/client.testimonial.interface';

@Injectable({
  providedIn: 'root'
})
export class TestimonialsService {

  constructor(
    private afs: AngularFirestore
  ) { }

  // testimonials that belong to a client
  getClientTestimonials(clientUid: string) {
    const tRef = this.afs.collection('public-client-testimonials', ref => ref.where('clientUid', '==', clientUid) );
    return tRef.valueChanges() as Observable<ClientTestimonial[]>;
  }

  // testimonials that belong to a coach
  getCoachTestimonials(coachUid: string) {
    const tRef = this.afs.collection('public-client-testimonials', ref => ref.where('coachUid', '==', coachUid) );
    return tRef.valueChanges() as Observable<ClientTestimonial[]>;
  }

  // Create or update a client testimonial
  setClientTestimonial(testimonial: ClientTestimonial) {

    // Custom doc ID for relationship
    const path = `public-client-testimonials/${testimonial.id}`;

    // Set the data, return the promise
    return this.afs
    .doc(path)
    .set(testimonial, {merge: true});
  }

  async markUserCoachTestimonialPrompted(clientUid: string, coachUid: string) {
    const timestampNow = Math.round(new Date().getTime() / 1000);
    return this.afs.collection(`users/${clientUid}/client-testimonial-prompts`)
    .doc(coachUid)
    .set({ prompted: timestampNow })
    .catch(err => console.error(err));
  }

  fetchUserCoachTestimonialPrompts(clientUid: string) {
    return this.afs.collection(`users/${clientUid}/client-testimonial-prompts`)
    .valueChanges({ idField: 'id' }) as Observable<any[]>;
  }

}
