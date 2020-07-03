import { Injectable } from '@angular/core';
import { CourseReview } from '../interfaces/course-review';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseReviewsService {

  constructor(
    private afs: AngularFirestore
  ) { }

  // Course reviews that belong to a reviewer
  getReviewerCourseReviews(reviewerUid: string) {
    const reviewsRef = this.afs.collection('course-reviews', ref => ref.where('reviewerUid', '==', reviewerUid) );
    return reviewsRef.valueChanges() as Observable<CourseReview[]>;
  }

  // Course reviews that belong to a seller (course creator)
  getSellerCourseReviews(sellerUid: string) {
    const reviewsRef = this.afs.collection('course-reviews', ref => ref.where('sellerUid', '==', sellerUid) );
    return reviewsRef.valueChanges() as Observable<CourseReview[]>;
  }

  // Get all course reviews that belong to a course
  getCourseReviews(courseId: string) {
    const reviewsRef = this.afs.collection('course-reviews', ref => ref.where('courseId', '==', courseId) );
    return reviewsRef.valueChanges() as Observable<CourseReview[]>;
  }

  // Create or update review
  setReview(review: CourseReview) {

    // Custom doc ID for relationship
    const reviewPath = `course-reviews/${review.reviewerUid}_${review.courseId}`;

    // Set the data, return the promise
    return this.afs
    .doc(reviewPath)
    .set(review, {merge: true});
  }
}
