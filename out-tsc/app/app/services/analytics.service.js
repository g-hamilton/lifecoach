var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as mixpanel from 'mixpanel-browser';
/*
  Using Mixpanel analytics
  Javascript Client Library:
  https://www.npmjs.com/package/mixpanel-browser

  Mixpanel People special properties:
  https://developer.mixpanel.com/docs/http#people-special-properties
*/
let AnalyticsService = class AnalyticsService {
    constructor(router) {
        this.router = router;
    }
    init() {
        mixpanel.init('396e30c4792b524a734d80ccbee3897c');
        console.log('Initialising Mixpanel analytics');
    }
    aliasUser(uid) {
        // Alias the user ID so Mixpanel associates the user's auth ID
        // with their original cookie based Mixpanel distinctID.
        mixpanel.alias(uid);
    }
    identifyUser(uid) {
        // Identify the user in Mixpanel by their uid.
        mixpanel.identify(uid);
    }
    setPeopleProperties(account) {
        mixpanel.people.set({
            $created: account.dateCreated ? account.dateCreated : new Date(),
            $email: account.accountEmail,
            $first_name: account.firstName,
            $last_name: account.lastName,
            userType: account.accountType
        });
    }
    registerUser(uid, method, account) {
        this.aliasUser(uid);
        this.identifyUser(uid);
        this.setPeopleProperties(account);
        mixpanel.track('Registered', {
            method,
            accountType: account.accountType
        });
    }
    signIn(uid, method, email) {
        this.identifyUser(uid);
        mixpanel.track('Signed In', {
            uid,
            method,
            email
        });
    }
    signOut() {
        mixpanel.track('Signed Out');
    }
    updateAccountEmail() {
        mixpanel.track('Updated account email');
    }
    updateAccountPassword() {
        mixpanel.track('Updated account password');
    }
    updatePeopleEmail(email) {
        mixpanel.people.set({
            $email: email
        });
    }
    updatePeopleName(firstName, lastName) {
        mixpanel.people.set({
            $first_name: firstName,
            $last_name: lastName,
        });
    }
    updateAccount() {
        mixpanel.track('Updated account info');
    }
    saveUserProfile(profile) {
        mixpanel.track('Saved profile', {
            isPublic: profile.isPublic
        });
    }
    deleteAccount() {
        mixpanel.track('Deleted account');
    }
    pageView() {
        mixpanel.track('Viewed page', {
            url: this.router.url
        });
    }
    searchCoaches(filters, query) {
        mixpanel.track('searched coaches', {
            searchTerm: query ? query : '',
            searchFilters: filters
        });
    }
    viewCoach(profile) {
        mixpanel.track('viewed coach', {
            coachUid: profile.objectID,
            coachSpeciality1: profile.speciality1.itemName,
            coachCountry: profile.country.name,
            coachCity: profile.city
        });
    }
    contactCoach(coachUid) {
        mixpanel.track('contacted coach', {
            coachUid
        });
    }
    sendChatMessage() {
        mixpanel.track('sent chat message');
    }
    startProfileVideoUpload() {
        mixpanel.track('started profile video upload');
    }
    completeProfileVideoUpload() {
        mixpanel.track('completed profile video upload');
    }
    startCourseVideoUpload() {
        mixpanel.track('started course video upload');
    }
    completeCourseVideoUpload() {
        mixpanel.track('completed course video upload');
    }
    startCoursePromoVideoUpload() {
        mixpanel.track('started course promotional video upload');
    }
    completeCoursePromoVideoUpload() {
        mixpanel.track('completed course promotional video upload');
    }
    startCourseResourceUpload() {
        mixpanel.track('started course resource upload');
    }
    completeCourseResourceUpload() {
        mixpanel.track('completed course resource upload');
    }
    attemptStripeConnect() {
        mixpanel.track('attempted Stripe connect');
    }
    completeStripeConnect() {
        mixpanel.track('completed Stripe connect');
    }
    manageStripeConnect() {
        mixpanel.track('managed Stripe connect');
    }
    attemptStripePayment() {
        mixpanel.track('attempted Stripe payment');
    }
    completeStripePayment() {
        mixpanel.track('completed Stripe payment');
    }
    failStripePayment() {
        mixpanel.track('failed Stripe payment');
    }
    attemptFreeCourseEnrollment() {
        mixpanel.track('attempted free course enrollment');
    }
    enrollInCourse(course) {
        mixpanel.track('enrolled in course', {
            pricingStrategy: course.pricingStrategy,
            price: course.price ? course.price : 0,
            currency: course.currency ? course.currency : null,
            title: course.title
        });
    }
    clickBrowseCourses() {
        mixpanel.track('clicked browse courses');
    }
    clickCreateCourse() {
        mixpanel.track('clicked create course');
    }
    clickCreateCourseSection() {
        mixpanel.track('clicked add course section');
    }
    clickCreateCourseLecture() {
        mixpanel.track('clicked add course lecture');
    }
    saveCourse() {
        mixpanel.track('saved course');
    }
    createCourseSection() {
        mixpanel.track('Created new course section');
    }
    editCourseSection() {
        mixpanel.track('Edited course section');
    }
    createCourseLecture(lecture) {
        mixpanel.track('Created new course lecture', {
            lectureType: lecture.type
        });
    }
    editCourseLecture() {
        mixpanel.track('Edited course lecture');
    }
    deleteCourseSection() {
        mixpanel.track('Deleted course section');
    }
    deleteCourseLecture() {
        mixpanel.track('Deleted course lecture');
    }
    submitCourseForReview() {
        mixpanel.track('Submitted course for review');
    }
    editCourseLandingPage() {
        mixpanel.track('Edited course landing page');
    }
    editCourseOptions() {
        mixpanel.track('Edited course options');
    }
    uploadCourseImage() {
        mixpanel.track('Uploaded course image');
    }
    searchCourses(filters, query) {
        mixpanel.track('searched courses', {
            searchTerm: query ? query : '',
            searchFilters: filters
        });
    }
    askCourseQuestion(question) {
        mixpanel.track('asked course question', {
            type: question.type
        });
    }
    sendCourseDiscussionReply(reply) {
        mixpanel.track('sent course question reply');
    }
    adminApproveCourse(courseId) {
        mixpanel.track('admin approved course', {
            courseId
        });
    }
    adminRejectCourse(courseId) {
        mixpanel.track('admin rejected course', {
            courseId
        });
    }
    addNewCoachingService(serviceId) {
        mixpanel.track('added new coaching service', {
            serviceId
        });
    }
    updateCoachingService(serviceId) {
        mixpanel.track('updated coaching service', {
            serviceId
        });
    }
};
AnalyticsService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [Router])
], AnalyticsService);
export { AnalyticsService };
//# sourceMappingURL=analytics.service.js.map