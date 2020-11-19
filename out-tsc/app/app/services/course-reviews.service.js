var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
let CourseReviewsService = class CourseReviewsService {
    constructor(afs) {
        this.afs = afs;
    }
    // Course reviews that belong to a reviewer
    getReviewerCourseReviews(reviewerUid) {
        const reviewsRef = this.afs.collection('course-reviews', ref => ref.where('reviewerUid', '==', reviewerUid));
        return reviewsRef.valueChanges();
    }
    // Course reviews that belong to a seller (course creator)
    getSellerCourseReviews(sellerUid) {
        const reviewsRef = this.afs.collection('course-reviews', ref => ref.where('sellerUid', '==', sellerUid));
        return reviewsRef.valueChanges();
    }
    // Get all course reviews that belong to a course
    getCourseReviews(courseId) {
        const reviewsRef = this.afs.collection('course-reviews', ref => ref.where('courseId', '==', courseId));
        return reviewsRef.valueChanges();
    }
    // Create or update review
    setReview(review) {
        // Custom doc ID for relationship
        const reviewPath = `course-reviews/${review.reviewerUid}_${review.courseId}`;
        // Set the data, return the promise
        return this.afs
            .doc(reviewPath)
            .set(review, { merge: true });
    }
    markUserCourseReviewPrompted(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestampNow = Math.round(new Date().getTime() / 1000);
            return this.afs.collection(`users/${userId}/course-review-prompts`)
                .doc(courseId)
                .set({ prompted: timestampNow })
                .catch(err => console.error(err));
        });
    }
    fetchUserCourseReviewPrompts(userId) {
        return this.afs.collection(`users/${userId}/course-review-prompts`)
            .valueChanges({ idField: 'id' });
    }
};
CourseReviewsService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [AngularFirestore])
], CourseReviewsService);
export { CourseReviewsService };
//# sourceMappingURL=course-reviews.service.js.map