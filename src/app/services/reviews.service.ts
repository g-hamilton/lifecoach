import { Injectable } from '@angular/core';
import { ProgramReview } from '../interfaces/program-review';
import { CourseReview } from '../interfaces/course-review';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ServiceReview } from 'app/interfaces/service.review.interface';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  constructor(
    private afs: AngularFirestore
  ) { }

  // PROGRAMS

  // reviews that belong to a reviewer
  getReviewerProgramReviews(reviewerUid: string) {
    const reviewsRef = this.afs.collection('program-reviews', ref => ref.where('reviewerUid', '==', reviewerUid) );
    return reviewsRef.valueChanges() as Observable<ProgramReview[]>;
  }

  // reviews that belong to a seller
  getSellerProgramReviews(sellerUid: string) {
    const reviewsRef = this.afs.collection('program-reviews', ref => ref.where('sellerUid', '==', sellerUid) );
    return reviewsRef.valueChanges() as Observable<ProgramReview[]>;
  }

  // reviews that belong to a program
  getProgramReviews(programId: string) {
    const reviewsRef = this.afs.collection('program-reviews', ref => ref.where('programId', '==', programId) );
    return reviewsRef.valueChanges() as Observable<ProgramReview[]>;
  }

  // Create or update a program review
  setProgramReview(review: ProgramReview) {

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

  // eCOURSES

  // reviews that belong to a reviewer
  getReviewerCourseReviews(reviewerUid: string) {
    const reviewsRef = this.afs.collection('course-reviews', ref => ref.where('reviewerUid', '==', reviewerUid) );
    return reviewsRef.valueChanges() as Observable<CourseReview[]>;
  }

  // reviews that belong to a seller
  getSellerCourseReviews(sellerUid: string) {
    const reviewsRef = this.afs.collection('course-reviews', ref => ref.where('sellerUid', '==', sellerUid) );
    return reviewsRef.valueChanges() as Observable<CourseReview[]>;
  }

  // reviews that belong to a course
  getCourseReviews(courseId: string) {
    const reviewsRef = this.afs.collection('course-reviews', ref => ref.where('courseId', '==', courseId) );
    return reviewsRef.valueChanges() as Observable<CourseReview[]>;
  }

  // create or update a course review
  setCourseReview(review: CourseReview) {

    // Custom doc ID for relationship
    const reviewPath = `course-reviews/${review.reviewerUid}_${review.courseId}`;

    // Set the data, return the promise
    return this.afs
    .doc(reviewPath)
    .set(review, {merge: true});
  }

  async markUserCourseReviewPrompted(userId: string, courseId: string) {
    const timestampNow = Math.round(new Date().getTime() / 1000);
    return this.afs.collection(`users/${userId}/course-review-prompts`)
    .doc(courseId)
    .set({ prompted: timestampNow })
    .catch(err => console.error(err));
  }

  fetchUserCourseReviewPrompts(userId: string) {
    return this.afs.collection(`users/${userId}/course-review-prompts`)
    .valueChanges({ idField: 'id' }) as Observable<any[]>;
  }

  // SERVICES (Bespoke Coaching Services)

  // PROGRAMS

  // reviews that belong to a reviewer
  getReviewerServiceReviews(reviewerUid: string) {
    const reviewsRef = this.afs.collection('service-reviews', ref => ref.where('reviewerUid', '==', reviewerUid) );
    return reviewsRef.valueChanges() as Observable<ServiceReview[]>;
  }

  // reviews that belong to a seller
  getSellerServiceReviews(sellerUid: string) {
    const reviewsRef = this.afs.collection('service-reviews', ref => ref.where('sellerUid', '==', sellerUid) );
    return reviewsRef.valueChanges() as Observable<ServiceReview[]>;
  }

  // reviews that belong to a service
  getServiceReviews(serviceId: string) {
    const reviewsRef = this.afs.collection('service-reviews', ref => ref.where('serviceId', '==', serviceId) );
    return reviewsRef.valueChanges() as Observable<ServiceReview[]>;
  }

  // Create or update a service review
  setServiceReview(review: ServiceReview) {

    // Custom doc ID for relationship
    const reviewPath = `service-reviews/${review.reviewerUid}_${review.serviceId}`;

    // Set the data, return the promise
    return this.afs
    .doc(reviewPath)
    .set(review, {merge: true});
  }

  async markUserServiceReviewPrompted(userId: string, serviceId: string) {
    const timestampNow = Math.round(new Date().getTime() / 1000);
    return this.afs.collection(`users/${userId}/service-review-prompts`)
    .doc(serviceId)
    .set({ prompted: timestampNow })
    .catch(err => console.error(err));
  }

  fetchUserServiceReviewPrompts(userId: string) {
    return this.afs.collection(`users/${userId}/service-review-prompts`)
    .valueChanges({ idField: 'id' }) as Observable<any[]>;
  }
}
