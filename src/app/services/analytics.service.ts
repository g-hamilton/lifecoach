import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import * as mixpanel from 'mixpanel-browser';

import { UserAccount } from '../interfaces/user.account.interface';
import { CoachingCourseLecture, CoachingCourse } from 'app/interfaces/course.interface';
import { CourseQuestion, CourseQuestionReply } from 'app/interfaces/q&a.interface';
import { CoachProfile } from 'app/interfaces/coach.profile.interface';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { StripePaymentIntentRequest } from 'app/interfaces/stripe.payment.intent.request';

/*
  Using Mixpanel analytics
  Javascript Client Library:
  https://www.npmjs.com/package/mixpanel-browser

  Mixpanel People special properties:
  https://developer.mixpanel.com/docs/http#people-special-properties
*/

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(
    private router: Router
  ) { }

  init() {
    mixpanel.init('396e30c4792b524a734d80ccbee3897c');
    // console.log('Initialising Mixpanel analytics');
  }

  aliasUser(uid: string) {
    // Alias the user ID so Mixpanel associates the user's auth ID
    // with their original cookie based Mixpanel distinctID.
    mixpanel.alias(uid);
  }

  identifyUser(uid: string) {
    // Identify the user in Mixpanel by their uid.
    mixpanel.identify(uid);
  }

  setPeopleProperties(account: UserAccount) {
    mixpanel.people.set({
      $created: account.dateCreated ? account.dateCreated : new Date(),
      $email: account.accountEmail,
      $first_name: account.firstName,
      $last_name: account.lastName,
      userType: account.accountType
    });
  }

  registerUser(uid: string, method: string, account: UserAccount) {
    this.aliasUser(uid);
    this.identifyUser(uid);
    this.setPeopleProperties(account);
    mixpanel.track('Registered', {
      method,
      accountType: account.accountType
    });
  }

  signIn(uid: string, method: string, email: string) {
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

  updatePeopleEmail(email: string) {
    mixpanel.people.set({
      $email: email
    });
  }

  updatePeopleName(firstName: string, lastName: string) {
    mixpanel.people.set({
      $first_name: firstName,
      $last_name: lastName,
    });
  }

  updateAccount() {
    mixpanel.track('Updated account info');
  }

  saveUserProfile(profile: any) {
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

  searchCoaches(filters: any, query?: string, ) {
    mixpanel.track('searched coaches', {
      searchTerm: query ? query : '',
      searchFilters: filters
    });
  }

  viewCoach(profile: CoachProfile) {
    mixpanel.track('viewed coach', {
      coachUid: profile.objectID,
      coachSpeciality1: profile.speciality1.itemName,
      coachCountry: profile.country.name,
      coachCity: profile.city
    });
  }

  contactCoach(coachUid: string) {
    mixpanel.track('contacted coach', {
      coachUid
    });
  }

  clickBrowseCoaches() {
    mixpanel.track('clicked browse coaches');
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

  attemptStripePayment(paymentIntent: StripePaymentIntentRequest) {
    mixpanel.track('attempted Stripe payment', {
      paymentIntent
    });
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

  enrollInCourse(course: CoachingCourse) {
    mixpanel.track('enrolled in course', {
      pricingStrategy: course.pricingStrategy,
      price: course.price ? course.price : 0,
      currency: course.currency ? course.currency : null,
      title: course.title,
      sellerUid: course.sellerUid
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

  createCourseLecture(lecture: CoachingCourseLecture) {
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

  searchCourses(filters: any, query?: string, ) {
    mixpanel.track('searched courses', {
      searchTerm: query ? query : '',
      searchFilters: filters
    });
  }

  askCourseQuestion(question: CourseQuestion) {
    mixpanel.track('asked course question', {
      type: question.type
    });
  }

  sendCourseDiscussionReply(reply?: CourseQuestionReply) {
    mixpanel.track('sent course question reply');
  }

  adminApproveCourse(courseId: string) {
    mixpanel.track('admin approved course', {
      courseId
    });
  }

  adminRejectCourse(courseId: string) {
    mixpanel.track('admin rejected course', {
      courseId
    });
  }

  clickCreateService() {
    mixpanel.track('clicked create service');
  }

  saveService() {
    mixpanel.track('saved service');
  }

  editServiceOutline() {
    mixpanel.track('Edited service outline');
  }

  editServiceLanding() {
    mixpanel.track('Edited service landing page');
  }

  startServicePromoVideoUpload() {
    mixpanel.track('started service promotional video upload');
  }

  completeServicePromoVideoUpload() {
    mixpanel.track('completed service promotional video upload');
  }

  submitServiceForReview() {
    mixpanel.track('Submitted service for review');
  }

  searchServices(filters: any, query?: string, ) {
    mixpanel.track('searched services', {
      searchTerm: query ? query : '',
      searchFilters: filters
    });
  }

  adminApproveService(serviceId: string) {
    mixpanel.track('admin approved service', {
      serviceId
    });
  }

  adminRejectService(serviceId: string) {
    mixpanel.track('admin rejected service', {
      serviceId
    });
  }

  purchaseService(service: CoachingService, purchasedSessions: number) {
    mixpanel.track('purchased service', {
      serviceId: service.serviceId,
      coachId: service.sellerUid,
      purchasedSessions
    });
  }

  clickCreateProgram() {
    mixpanel.track('clicked create program');
  }

  saveProgram() {
    mixpanel.track('saved program');
  }

  editProgramOutline() {
    mixpanel.track('Edited program outline');
  }

  editProgramLanding() {
    mixpanel.track('Edited program landing page');
  }

  startProgramPromoVideoUpload() {
    mixpanel.track('started program promotional video upload');
  }

  completeprogramPromoVideoUpload() {
    mixpanel.track('completed program promotional video upload');
  }

  submitProgramForReview() {
    mixpanel.track('Submitted program for review');
  }

  enrollInProgram(program: CoachingProgram) {
    mixpanel.track('enrolled in program', {
      pricingStrategy: program.pricingStrategy,
      fullPrice: program.fullPrice,
      payPerSessionPrice: program.pricePerSession ? program.pricePerSession : null,
      currency: program.currency ? program.currency : null,
      title: program.title,
      sellerUid: program.sellerUid
    });
  }

  searchPrograms(filters: any, query?: string, ) {
    mixpanel.track('searched programs', {
      searchTerm: query ? query : '',
      searchFilters: filters
    });
  }

  adminApproveProgram(programId: string) {
    mixpanel.track('admin approved program', {
      programId
    });
  }

  adminRejectProgram(programId: string) {
    mixpanel.track('admin rejected program', {
      programId
    });
  }

  clickBrowsePrograms() {
    mixpanel.track('clicked browse programs');
  }

  orderCoachSession(type: 'discovery' | 'session', userId: string, coachId: string, sessionId: string) {
    mixpanel.track('ordered coaching session', {
      type,
      userId,
      coachId,
      sessionId
    });
  }

  cancelCoachSession(type: 'discovery' | 'session', sessionId: string, cancelledById: string) {
    mixpanel.track('ordered coaching session', {
      type,
      sessionId,
      cancelledById
    });
  }

  createCoachSession(type: 'discovery' | 'session', coachId: string, sessionId: string) {
    mixpanel.track('created coaching session', {
      type,
      coachId,
      sessionId
    });
  }

  markSessionComplete() {
    mixpanel.track('marked session complete');
  }

  clickGetStarted() {
    mixpanel.track('clicked get started');
  }

  partnerTrackingCodeDetectedInRoute(partnerUid: string) {
    mixpanel.track('detected partner tracking code', {
      partnerUid
    });
  }

  savedValidPartnerTrackingCodeDetected(partnerUid: string) {
    mixpanel.track('detected partner tracking code', {
      partnerUid
    });
  }

  savedInvalidPartnerTrackingCodeDetected(partnerUid: string) {
    mixpanel.track('detected partner tracking code', {
      partnerUid
    });
  }

}
