import { Injectable } from '@angular/core';
import { ProgramReview } from '../interfaces/program-review';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgramReviewsService {

  constructor(
    private afs: AngularFirestore
  ) { }

  // Program reviews that belong to a reviewer
  getReviewerProgramReviews(reviewerUid: string) {
    const reviewsRef = this.afs.collection('program-reviews', ref => ref.where('reviewerUid', '==', reviewerUid) );
    return reviewsRef.valueChanges() as Observable<ProgramReview[]>;
  }

  // Program reviews that belong to a seller (program creator)
  getSellerProgramReviews(sellerUid: string) {
    const reviewsRef = this.afs.collection('program-reviews', ref => ref.where('sellerUid', '==', sellerUid) );
    return reviewsRef.valueChanges() as Observable<ProgramReview[]>;
  }

  // Get all program reviews that belong to a program
  getProgramReviews(programId: string) {
    const reviewsRef = this.afs.collection('program-reviews', ref => ref.where('programId', '==', programId) );
    return reviewsRef.valueChanges() as Observable<ProgramReview[]>;
  }

  // Create or update review
  setReview(review: ProgramReview) {

    // Custom doc ID for relationship
    const reviewPath = `program-reviews/${review.reviewerUid}_${review.programId}`;

    // Set the data, return the promise
    return this.afs
    .doc(reviewPath)
    .set(review, {merge: true});
  }

  async markUserProgramReviewPrompted(userId: string, programId: string) {
    const timestampNow = Math.round(new Date().getTime() / 1000);
    return this.afs.collection(`users/${userId}/program-review-prompts`)
    .doc(programId)
    .set({ prompted: timestampNow })
    .catch(err => console.error(err));
  }

  fetchUserProgramReviewPrompts(userId: string) {
    return this.afs.collection(`users/${userId}/program-review-prompts`)
    .valueChanges({ idField: 'id' }) as Observable<any[]>;
  }
}
