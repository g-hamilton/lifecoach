import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';

import { UserTask } from '../interfaces/user.tasks.interface';
import { UserAccount } from '../interfaces/user.account.interface';
import { CoachProfile } from '../interfaces/coach.profile.interface';
import { ChatMessage } from 'app/interfaces/chat.message';
import { CoachingCourse, CoachingCourseVideo } from 'app/interfaces/course.interface';
import { AdminCourseReviewRequest } from 'app/interfaces/admin.course.review.interface';
import { CourseBookmark } from 'app/interfaces/course.bookmark.interface';
import { CourseQuestion, CourseQuestionReply } from 'app/interfaces/q&a.interface';
import { AnalyticsService } from './analytics.service';
import { CustomCalendarEvent } from 'app/interfaces/custom.calendar.event.interface';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { first } from 'rxjs/operators';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { AdminProgramReviewRequest } from 'app/interfaces/admin.program.review.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private db: AngularFirestore,
    private analyticsService: AnalyticsService
  ) {
  }

  // ================================================================================
  // =====                        USER TASKS / TODOS                           ======
  // ================================================================================

  getUserTasksTodos(uid: string) {
    return this.db.collection(`users/${uid}/tasks-todo`)
      .valueChanges() as Observable<UserTask[]>;
  }

  deleteUserTaskTodo(uid: string, taskId: string) {
    return this.db.collection(`users/${uid}/tasks-todo`)
      .doc(taskId)
      .get()
      .pipe(first())
      .subscribe(documentSnap => {
        if (documentSnap.exists) {
          this.db.collection(`users/${uid}/tasks-todo`)
            .doc(taskId)
            .delete()
            .catch(err => console.error(err));
        }
      });
  }

  async completeUserTask(uid: string, taskId: string) {
    const tempSub = this.getUserTasksTodos(uid)
      .pipe(first())
      .subscribe(todos => {
        if (todos) {
          todos.forEach(task => {
            if (task.id === taskId) {
              return this.db.collection(`users/${uid}/tasks-complete`)
                .doc(taskId)
                .set(task, {merge: true});
            }
          });
          this.deleteUserTaskTodo(uid, taskId);
        }
        tempSub.unsubscribe();
      });
  }

  // ================================================================================
  // =====                           USER PROFILES                             ======
  // ================================================================================

  async saveCoachProfile(uid: string, profile: CoachProfile) {
    return this.db.collection(`users/${uid}/profile`)
      .doc(`profile${uid}`)
      .set(profile, {merge: true})
      .catch(err => console.error(err));
  }

  getCoachProfile(uid: string) {
    return this.db.collection(`users/${uid}/profile`)
      .doc(`profile${uid}`)
      .valueChanges() as Observable<CoachProfile>;
  }

  getPublicCoachProfile(uid: string) {
    return this.db.collection(`public-coaches`)
      .doc(`${uid}`)
      .valueChanges() as Observable<CoachProfile>;
  }

  getRegularProfile(uid: string) {
    return this.db.collection(`users/${uid}/regularProfile`)
      .doc(`profile${uid}`)
      .valueChanges() as Observable<any>;
  }

  // ================================================================================
  // =====                            USER ACCOUNTS                            ======
  // ================================================================================

  getUserAccount(uid: string) {
    return this.db.collection(`users/${uid}/account`)
      .doc(`account${uid}`)
      .valueChanges() as Observable<UserAccount>;
  }

  async updateUserAccount(uid: string, partial: {}) {
    return this.db.collection(`users/${uid}/account`)
      .doc(`account${uid}`)
      .update(partial)
      .catch(err => console.error(err));
  }

  // ================================================================================
  // =====                           USER MESSAGES                             ======
  // ================================================================================

  getUserRooms(uid: string) {
    // Returns just the userRooms document with the lastActiveRoom property on it.
    return this.db.collection(`userRooms`)
      .doc(uid)
      .valueChanges() as Observable<any>;
  }

  getAllUserRooms(uid: string) {
    // Returns all the user's current chat rooms.
    return this.db.collection(`userRooms/${uid}/rooms`)
      .valueChanges() as Observable<any[]>;
  }

  // NB: This method will return a chat feed in realtime but it won't paginate data.
  // For pagination, use the pagination.service.ts instead.
  getRoomFeed(roomId: string) {
    return this.db.collection(`chatrooms/${roomId}/messages`, ref => ref
      .limitToLast(25)
      .orderBy('sent', 'asc'))
      .valueChanges() as Observable<ChatMessage[]>;
  }

  async updateUserRoomLastReadTimestamp(uid: string, roomId: string) {
    return this.db.collection(`userRooms/${uid}/rooms`)
      .doc(roomId)
      .set({
        lastRead: Math.round(new Date().getTime() / 1000) // unix timestamp
      }, {merge: true})
      .catch(err => console.error(err));
  }

  async getUserRoomUnreadMessageCount(roomId: string, lastRead: number): Promise<number> {
    return new Promise(resolve => {
      if (lastRead) { // the room has been read by the user
        const snap = this.db.collection(`chatrooms/${roomId}/messages`, ref => ref
          .where('sent', '>', lastRead))
          .get();
        snap.pipe(first()).subscribe(data => {
          resolve(data.size as number);
        });
      } else { // the room has never been read by the user
        const snap = this.db.collection(`chatrooms/${roomId}/messages`)
          .get();
        snap.pipe(first()).subscribe(data => {
          resolve(data.size as number);
        });
      }
    });
  }

  // ================================================================================
  // =====                        USER PROFILE VIDEO                           ======
  // ================================================================================

  getProfileVideos(uid: string) {
    // Returns all the user's saved profile video documents along with the doc IDs.
    return this.db.collection(`users/${uid}/profileVideos`)
      .valueChanges({idField: 'id'}) as Observable<any[]>;
  }

  async deleteProfileVideoData(uid: string, docId: string) {
    return this.db.collection(`users/${uid}/profileVideos`)
      .doc(docId)
      .delete()
      .catch(err => console.error(err));
  }

  // ================================================================================
  // =====                            USER COURSES                             ======
  // ================================================================================

  getPublicCourse(courseId: string) {
    // Returns a course document.
    return this.db.collection(`public-courses`)
      .doc(courseId)
      .valueChanges() as Observable<CoachingCourse>;
  }

  getUnlockedPublicCourse(courseId: string) {
    // Returns a course document.
    return this.db.collection(`locked-course-content`)
      .doc(courseId)
      .valueChanges() as Observable<CoachingCourse>;
  }

  getPublicCoursesBySeller(sellerUid: string) {
    const coursesRef = this.db.collection('public-courses', ref => ref.where('sellerUid', '==', sellerUid));
    return coursesRef.valueChanges() as Observable<CoachingCourse[]>;
  }

  getPrivateCourse(userId: string, courseId: string) {
    // Returns a course document.
    return this.db.collection(`users/${userId}/courses`)
      .doc(courseId)
      .valueChanges() as Observable<CoachingCourse>;
  }

  getPurchasedCourses(uid: string) {
    // Returns all the user's purchased course documents along with the doc IDs.
    return this.db.collection(`users/${uid}/purchased-courses`)
      .valueChanges({idField: 'id'}) as Observable<[]>;
  }

  getPrivateCourses(uid: string) {
    // Returns all the user's created courses (as seller) documents.
    return this.db.collection(`users/${uid}/courses`)
      .valueChanges() as Observable<CoachingCourse[]>;
  }

  getCourseSalesByMonth(uid: string, month: number, year: number, courseId: string) {
    // Returns all the user's course sales documents for month and year, along with the doc IDs.
    return this.db.collection(`users/${uid}/sales/${month}-${year}/${courseId}`)
      .valueChanges({idField: 'id'}) as Observable<any[]>;
  }

  getLifetimeTotalCourseSales(uid: string, courseId: string) {
    // Returns a document containing lifetime sales totals.
    return this.db.collection(`users/${uid}/sales/total-lifetime-course-sales/courses`)
      .doc(courseId)
      .valueChanges() as Observable<any>;
  }

  getTotalPublicEnrollmentsByCourse(courseId: string) {
    // Returns a document containing a courses total lifetime enrollments
    return this.db.collection(`course-enrollments`)
      .doc(courseId)
      .valueChanges() as Observable<any>;
  }

  getTotalPublicEnrollmentsByCourseSeller(sellerUid: string) {
    // Returns a document containing a coach's total lifetime course enrollments (across all courses)
    return this.db.collection(`seller-course-enrollments`)
      .doc(sellerUid)
      .valueChanges() as Observable<any>;
  }

  async savePrivateCourse(uid: string, course: CoachingCourse) {
    // track
    this.analyticsService.saveCourse();
    // Saves a user's course to a document with matching id
    return this.db.collection(`users/${uid}/courses`)
      .doc(course.courseId)
      .set(course, {merge: true})
      .catch(err => console.error(err));
  }

  getUserCourseLibraryTotals(userId: string) {
    return this.db.collection(`users/${userId}/courseLibrary/totals/items`)
      .doc('itemTotals')
      .valueChanges() as Observable<any>;
  }

  getInitialCourseLibraryItems(userId: string, limitTo: number) {
    return this.db.collection(`users/${userId}/courseLibrary`, ref => ref
      .orderBy('lastUploaded', 'desc')
      .limit(limitTo))
      .valueChanges({idField: 'id'}) as Observable<any[]>;
  }

  getNextCourseLibraryItems(userId: string, limitTo: number, lastDoc: any) {
    // console.log('lastdoc:', lastDoc);
    return this.db.collection(`users/${userId}/courseLibrary`, ref => ref
      .orderBy('lastUploaded', 'desc')
      .startAfter(lastDoc.lastUploaded) // must match the .orderBy field!
      .limit(limitTo))
      .valueChanges({idField: 'id'}) as Observable<any[]>;
  }

  getPreviousCourseLibraryItems(userId: string, limitTo: number, firstDoc: any) {
    // console.log('firstdoc:', firstDoc);
    return this.db.collection(`users/${userId}/courseLibrary`, ref => ref
      .orderBy('lastUploaded', 'desc')
      .endBefore(firstDoc.lastUploaded) // must match the .orderBy field!
      .limitToLast(limitTo))
      .valueChanges({idField: 'id'}) as Observable<any[]>;
  }

  getCourseReviewRequest(courseId: string) {
    return this.db.collection(`admin/review-requests/courses`)
      .doc(courseId)
      .valueChanges() as Observable<AdminCourseReviewRequest>;
  }

  async requestCourseReview(course: CoachingCourse) {
    if (!course.sellerUid) {
      console.error('Unable to request review: no seller UID');
      return;
    }
    if (!course.courseId) {
      console.error('Unable to request review: no course ID');
      return;
    }

    const requestDate = Math.round(new Date().getTime() / 1000); // set unix timestamp
    const reviewRequest: AdminCourseReviewRequest = {
      courseId: course.courseId,
      sellerUid: course.sellerUid,
      requested: requestDate,
      status: 'submitted'
    };

    await this.db.collection(`admin/review-requests/courses`)
      .doc(course.courseId)
      .set(reviewRequest, {merge: true})
      .catch(err => console.error(err));

    return this.db.collection(`users/${course.sellerUid}/courses`)
      .doc(course.courseId)
      .set({reviewRequest}, {merge: true})
      .catch(err => console.error(err));
  }

  getTotalAdminCoursesInReview() {
    return this.db.collection(`admin`)
      .doc('totalCoursesInReview')
      .valueChanges() as Observable<any>;
  }

  getInitialAdminCoursesInReview(limitTo: number) {
    return this.db.collection(`admin/review-requests/courses`, ref => ref
      .orderBy('requested', 'asc')
      .limit(limitTo))
      .valueChanges({idField: 'id'}) as Observable<AdminCourseReviewRequest[]>;
  }

  getNextAdminCoursesInReview(limitTo: number, lastDoc: any) {
    return this.db.collection(`admin/review-requests/courses`, ref => ref
      .orderBy('requested', 'asc')
      .startAfter(lastDoc.requested) // must match the .orderBy field!
      .limit(limitTo))
      .valueChanges({idField: 'id'}) as Observable<AdminCourseReviewRequest[]>;
  }

  getPreviousAdminCoursesInReview(limitTo: number, firstDoc: any) {
    return this.db.collection(`admin/review-requests/courses`, ref => ref
      .orderBy('requested', 'asc')
      .endBefore(firstDoc.requested) // must match the .orderBy field!
      .limitToLast(limitTo))
      .valueChanges({idField: 'id'}) as Observable<AdminCourseReviewRequest[]>;
  }

  getPrivateCourseLecturesComplete(userId: string, courseId: string) {
    return this.db.collection(`users/${userId}/purchased-courses/${courseId}/lectures-complete`)
      .valueChanges({idField: 'id'}) as Observable<any[]>;
  }

  async savePrivateLectureComplete(userId: string, courseId: string, lectureId: string) {
    return this.db.collection(`users/${userId}/purchased-courses/${courseId}/lectures-complete`)
      .doc(lectureId)
      .set({id: lectureId}, {merge: true})
      .catch(err => console.error(err));
  }

  async savePrivateLectureIncomplete(userId: string, courseId: string, lectureId: string) {
    return this.db.collection(`users/${userId}/purchased-courses/${courseId}/lectures-complete`)
      .doc(lectureId)
      .delete()
      .catch(err => console.error(err));
  }

  async savePrivateCourseBookmark(bookmark: CourseBookmark) {
    return this.db.collection(`users/${bookmark.userId}/bookmarks`)
      .doc(`${bookmark.courseId}_${bookmark.lastUpdated}`)
      .set(bookmark, {merge: true})
      .catch(err => console.error(err));
  }

  getPrivateBookmarksByCourse(userId: string, courseId: string) {
    const bookmarksRef = this.db.collection(`users/${userId}/bookmarks`, ref => ref
      .where('courseId', '==', courseId)
    );
    return bookmarksRef.valueChanges({idField: 'id'}) as Observable<CourseBookmark[]>;
  }

  async deletePrivateCourseBookmark(bookmark: CourseBookmark) {
    return this.db.collection(`users/${bookmark.userId}/bookmarks`)
      .doc(`${bookmark.courseId}_${bookmark.lastUpdated}`)
      .delete()
      .catch(err => console.error(err));
  }

  async saveCourseQuestion(question: CourseQuestion) {
    return this.db.collection(`public-course-questions`)
      .doc(question.id)
      .set(question, {merge: true})
      .catch(err => console.error(err));
  }

  async saveCourseReply(reply: CourseQuestionReply) {
    return this.db.collection(`public-course-questions/${reply.questionId}/replies`)
      .doc(reply.id)
      .set(reply, {merge: true})
      .catch(err => console.error(err));
  }

  getInitialCourseQuestions(courseId: string, limitTo: number) {
    return this.db.collection(`public-course-questions`, ref => ref
      .where('courseId', '==', courseId)
      .orderBy('created', 'desc')
      .limit(limitTo))
      .valueChanges({idField: 'id'}) as Observable<CourseQuestion[]>;
  }

  getNextCourseQuestions(courseId: string, limitTo: number, lastDoc: any) {
    // console.log('lastdoc:', lastDoc);
    return this.db.collection(`public-course-questions`, ref => ref
      .where('courseId', '==', courseId)
      .orderBy('created', 'desc')
      .startAfter(lastDoc.created) // must match the .orderBy field!
      .limit(limitTo))
      .valueChanges({idField: 'id'}) as Observable<CourseQuestion[]>;
  }

  getPreviousCourseQuestions(courseId: string, limitTo: number, firstDoc: any) {
    // console.log('firstdoc:', firstDoc);
    return this.db.collection(`public-course-questions`, ref => ref
      .where('courseId', '==', courseId)
      .orderBy('created', 'desc')
      .endBefore(firstDoc.created) // must match the .orderBy field!
      .limitToLast(limitTo))
      .valueChanges({idField: 'id'}) as Observable<CourseQuestion[]>;
  }

  getInitialQuestionReplies(questionId: string, limitTo: number) {
    return this.db.collection(`public-course-questions/${questionId}/replies`, ref => ref
      .orderBy('created', 'asc')
      .limit(limitTo))
      .valueChanges({idField: 'id'}) as Observable<CourseQuestionReply[]>;
  }

  getNextQuestionReplies(questionId: string, limitTo: number, lastDoc: any) {
    // console.log('lastdoc:', lastDoc);
    return this.db.collection(`public-course-questions/${questionId}/replies`, ref => ref
      .orderBy('created', 'asc')
      .startAfter(lastDoc.created) // must match the .orderBy field!
      .limit(limitTo))
      .valueChanges({idField: 'id'}) as Observable<CourseQuestionReply[]>;
  }

  getPreviousQuestionReplies(questionId: string, limitTo: number, firstDoc: any) {
    // console.log('firstdoc:', firstDoc);
    return this.db.collection(`public-course-questions/${questionId}/replies`, ref => ref
      .orderBy('created', 'asc')
      .endBefore(firstDoc.created) // must match the .orderBy field!
      .limitToLast(limitTo))
      .valueChanges({idField: 'id'}) as Observable<CourseQuestionReply[]>;
  }

  getCourseQuestionById(questionId: string) {
    return this.db.collection(`public-course-questions`)
      .doc(questionId)
      .valueChanges() as Observable<CourseQuestion>;
  }

  upVoteCourseQuestion(question: CourseQuestion, userId: string) {
    return this.db.collection(`public-course-questions/${question.id}/upvotes`)
      .doc(userId)
      .set({upvotedBy: userId}, {merge: true});
  }

  upVoteCourseQuestionReply(reply: CourseQuestionReply, userId: string) {
    return this.db.collection(`public-course-questions/${reply.questionId}/replies/${reply.id}/upvotes`)
      .doc(userId)
      .set({upvotedBy: userId}, {merge: true});
  }

  async deletePrivateCourse(userId: string, courseId: string) {
    return this.db.collection(`users/${userId}/courses`)
      .doc(courseId)
      .delete()
      .catch(err => console.error(err));
  }

  async markCourseCompleteForUser(userId: string, course: CoachingCourse) {
    const timestampNow = Math.round(new Date().getTime() / 1000);

    // mark the course as complete for this user
    await this.db.collection(`users/${userId}/courses-complete`)
      .doc(course.courseId)
      .set({completed: timestampNow})
      .catch(err => console.error(err));

    // save the action to this user's history with this coach
    await this.db.collection(`users/${userId}/coaches/${course.sellerUid}/history`)
    .doc(timestampNow.toString())
    .set({ action: 'completed_self_study_course', courseId: course.courseId });

    // save the action to this person's history for the course creator
    return this.db.collection(`users/${course.sellerUid}/people/${userId}/history`)
      .doc(timestampNow.toString())
      .set({ action: 'completed_self_study_course', courseId: course.courseId });
  }

  getUserCoursesComplete(userId: string) {
    return this.db.collection(`users/${userId}/courses-complete`)
      .valueChanges({idField: 'id'}) as Observable<any[]>;
  }

  // ================================================================================
  // =====                          RATES / CURRENCY                           ======
  // ================================================================================

  getPlatformRates() {
    // Returns a rates document.
    return this.db.collection(`currency`)
      .doc('rates')
      .valueChanges() as Observable<any>;
  }

  // ================================================================================
  // =====                          PAYMENT HISTORY                            ======
  // ================================================================================

  getSuccessfulPayments(uid: string) {
    // Returns all the user's successful payment documents along with the doc IDs.
    return this.db.collection(`users/${uid}/account/account${uid}/successful-payments`)
      .valueChanges({idField: 'id'}) as Observable<any[]>;
  }

  getFailedPayments(uid: string) {
    // Returns all the user's successful payment documents along with the doc IDs.
    return this.db.collection(`users/${uid}/account/account${uid}/failed-payments`)
      .valueChanges({idField: 'id'}) as Observable<any[]>;
  }

  getSuccessfulPaymentIntent(userId: string, paymentIntentId: string) {
    // Returns a successful Stripe payment intent document.
    return this.db.collection(`users/${userId}/account/account${userId}/successful-payments`)
      .doc(paymentIntentId)
      .valueChanges() as Observable<any>;
  }

  // ================================================================================
  // =====                              REFUNDS                                ======
  // ================================================================================

  getUserRefunds(uid: string) {
    // Returns all the user's refund documents along with the doc IDs.
    return this.db.collection(`users/${uid}/account/account${uid}/refunds`)
      .valueChanges({idField: 'id'}) as Observable<any[]>;
  }

  // ================================================================================
  // =====                          CALENDAR EVENTS                            ======
  // ================================================================================
  dateToKeyHelper(date: Date) { // probably unnecessary function, could be removed
    const temp = new Date(date);
    const today = temp.getDay();
    temp.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(temp.getTime() - 86400000 * today);
    const endOfWeek = new Date(temp.getTime() + 86400000 * (6 - today));
    return `${startOfWeek.getFullYear()}-${startOfWeek.getMonth()}-${startOfWeek.getDate()}-${endOfWeek.getFullYear()}-${endOfWeek.getMonth()}-${endOfWeek.getDate()}`;
  }


  async saveUserCalendarEvent(uid: string, date: Date, event: CustomCalendarEvent) {
    return this.db.collection(`users/${uid}/calendar`)
      .doc(event.start.getTime().toString())
      .set(event)
      .catch(err => console.error(err));
  }

  getUserCalendarEvents(uid: string, date: Date) {
    return this.db.collection(`users/${uid}/calendar`)
      // ref => ref.where('__name__', '>', '1604359800000')
      //         .where('__name__', '<', '1604458500000')
      .valueChanges() as Observable<CustomCalendarEvent[]>;
  }

  // This is redundant and it will be reworked in a final version of app, but now we need it to control session duration changes
  hasUserEvents(uid: string) {
    return this.db.collection(`users/${uid}/calendar`)
      .get()
      .toPromise()
      .then(querySnapshot => querySnapshot.size > 0);
  }


  //
  async reserveEvent(uid: string, coachId: string, id: string) { // Reservation from the Client Side
    return this.db.collection(`users/${coachId}/calendar`, ref => ref.where('id', '==', id))
      .get().toPromise()
      .then(querySnapshot => {
        if (!querySnapshot.empty) {
          // We know that there is one doc in the querySnapshot
          const queryDocumentSnapshot = querySnapshot.docs[0];
          return queryDocumentSnapshot.ref
            .update({
              reserved: true,
              reservedById: uid,
              createdOn: new Date(),
              cssClass: 'reserved'
            })
            .then(() => {
              console.log('Successful');
              // Write this task to the temporary-reserved-tasks table
              this.db.collection(`temporary-reserved-events`).add({
                calendarId: id,
                coachId,
                timeOfReserve: Date.now()
              }).then(docRef => console.log(docRef.id))
                .catch(err => console.log(err));
            })
            .then(() => {
              console.log('Successful');
              // Write this task to the users-reserved table
              this.db.collection(`users/${uid}/reserved-events`).add({
                calendarId: id,
                coachId,
                timeOfReserve: Date.now()
              }).then(docRef => console.log(docRef.id))
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        } else {
          console.log('This event is not available');
          return null;
        }
      });
  }

  // Function responsibilities :
  async orderSession(coachId: string, calendarId: string, time: number, uid: string) {
    console.group('ORDERING SESSION');
    // tslint:disable-next-line: one-variable-per-declaration
    let newDocId: string | undefined, newDocRef: any, sessionObject: any;
    return this.db.collection(`temporary-reserved-events`,
      ref => ref.where('coachId', '==', coachId)
        .where('calendarId', '==', calendarId))
      .get().toPromise()
      .then(qSnapshot => {
        console.log('1', qSnapshot);
        if (qSnapshot) {
          qSnapshot.docs[0].ref.delete()
            .then(() => console.log('2'))
            .catch(e => alert('Error 2'));
        }
      }).catch(e => console.log('error 1'))
      .then(() => {
          console.log('3');
          this.db.collection(`ordered-sessions/all/sessions`).add({
            // sessionId: `${coachId}_${calendarId}`,
            coachId,
            timeOfReserve: Date.now(),
            participants: [coachId, uid],
            testField: 'testField'
          }).then(docRef => {
            console.log('4', docRef.id);
            newDocId = docRef.id;
            newDocRef = docRef;
          }).catch(e => console.log('4'))
            .then( () => {
              this.db.collection(`users/${coachId}/calendar`,
                ref => ref.where('id', '==', calendarId))
                .get().toPromise()
                .then(querySnapshot => {
                  console.log('5', querySnapshot);
                  if (!querySnapshot.empty) {
                    // Changing event in coach calendar
                    const queryDocumentSnapshot = querySnapshot.docs[0];
                    sessionObject = queryDocumentSnapshot.data();
                    return queryDocumentSnapshot.ref
                      .update({
                        ordered: true,
                        orderedById: uid,
                        cssClass: 'ordered',
                        sessionId: newDocRef.id,
                        sessionRef: newDocRef
                      }).catch(e => console.log('error on update'));
                  }
                })
                .then(() => {
                  this.db.collection(`users/${uid}/reserved-events`,
                    ref => ref.where('coachId', '==', coachId)
                      .where('calendarId', '==', calendarId))
                    .get().toPromise().then(querySnapshot => {
                    console.log('5', querySnapshot);
                    if (!querySnapshot.empty) {
                      // Changing event in coach calendar
                      const queryDocumentSnapshot = querySnapshot.docs[0];
                      console.log(queryDocumentSnapshot);
                      return queryDocumentSnapshot.ref.delete()
                        .then(() => console.log('Deleted from user`s reserved-events'))
                        .catch(e => console.log('can`t delete from user`s reserved-events'));
                    }
                  });
                })
                .then(() => {
                  console.log('6');
                  this.db.collection(`users/${uid}/ordered-sessions`).add({
                    start: sessionObject.start,
                    end: sessionObject.end,
                    sessionId: newDocRef.id,
                    sessionRef: newDocRef,
                  }).catch(e => console.log('error 6'));
                })
                .then(() => {
                  newDocRef.update({
                    start: sessionObject.start,
                    end: sessionObject.end,
                  });
                })
                .catch(err => console.log(err, 'Не могу создать'));
            });
      }).catch(e => console.log('v konce'));


  }


  getUserNotReservedEvents(uid: string, date?: Date) {
    console.log('Data Service works');

    if (date) {
      console.log(date);
      const startTime = new Date(date.setHours(0, 0, 0, 0));
      const endTime = new Date(date.setHours(24));
      console.log('Возможно, undefined', startTime, endTime);
      return this.db.collection(`users/${uid}/calendar`, ref => ref
        .where('reserved', '==', false)
        .where('start', '>=', startTime)
        .where('start', '<', endTime)
      ).valueChanges() as Observable<CustomCalendarEvent[]>;
    } else {
      return this.db.collection(`users/${uid}/calendar`, ref => ref
        .where('reserved', '==', false))
        .valueChanges() as Observable<CustomCalendarEvent[]>;
    }
  }

  // TODO:
  getUserReservedEvents(uid: string) {
    return this.db.collection(`users/${uid}/reserved-events`)
      .valueChanges() as Observable<CustomCalendarEvent[]>;
  }

  async deleteUserCalendarEvent(uid: string, date: Date) {
    return this.db.collection(`users/${uid}/calendar`)
      .doc(date.getTime().toString())
      .delete()
      .catch(err => console.error(err));
  }

  // ================================================================================
  // =====                           COACH PROGRAMS                            ======
  // ================================================================================

  getPrivateProgram(userId: string, programId: string) {
    // Returns a coaching program document.
    return this.db.collection(`users/${userId}/programs`)
      .doc(programId)
      .valueChanges() as Observable<CoachingProgram>;
  }

  getProgramReviewRequest(programId: string) {
    return this.db.collection(`admin/review-requests/programs`)
      .doc(programId)
      .valueChanges() as Observable<AdminProgramReviewRequest>;
  }

  async savePrivateProgram(uid: string, program: CoachingProgram) {
    // track
    this.analyticsService.saveProgram();
    // Saves a user's program to a document with matching id
    return this.db.collection(`users/${uid}/programs`)
      .doc(program.programId)
      .set(program, {merge: true})
      .catch(err => console.error(err));
  }

  async requestProgramReview(program: CoachingProgram) {
    if (!program.sellerUid) {
      console.error('Unable to request review: no seller UID');
      return;
    }
    if (!program.programId) {
      console.error('Unable to request review: no program ID');
      return;
    }

    const requestDate = Math.round(new Date().getTime() / 1000); // set unix timestamp
    const reviewRequest: AdminProgramReviewRequest = {
      programId: program.programId,
      sellerUid: program.sellerUid,
      requested: requestDate,
      status: 'submitted'
    };

    await this.db.collection(`admin/review-requests/programs`)
      .doc(program.programId)
      .set(reviewRequest, {merge: true})
      .catch(err => console.error(err));

    return this.db.collection(`users/${program.sellerUid}/programs`)
      .doc(program.programId)
      .set({reviewRequest}, {merge: true})
      .catch(err => console.error(err));
  }

  getPublicProgram(programId: string) {
    // Returns a program document.
    return this.db.collection(`public-programs`)
      .doc(programId)
      .valueChanges() as Observable<CoachingProgram>;
  }

  getTotalPublicEnrollmentsByProgram(programId: string) {
    // Returns a document containing a program's total lifetime enrollments
    return this.db.collection(`program-enrollments`)
      .doc(programId)
      .valueChanges() as Observable<any>;
  }

  getPrivatePrograms(uid: string) {
    // Returns all the user's created program (as seller) documents.
    return this.db.collection(`users/${uid}/programs`)
      .valueChanges() as Observable<CoachingProgram[]>;
  }

  getProgramSalesByMonth(uid: string, month: number, year: number, programId: string) {
    // Returns all the user's program sales documents for month and year, along with the doc IDs.
    return this.db.collection(`users/${uid}/program-sales/${month}-${year}/${programId}`)
      .valueChanges({idField: 'id'}) as Observable<any[]>;
  }

  getLifetimeTotalProgramSales(uid: string, programId: string) {
    // Returns a document containing lifetime sales totals.
    return this.db.collection(`users/${uid}/program-sales/total-lifetime-program-sales/programs`)
      .doc(programId)
      .valueChanges() as Observable<any>;
  }

  getTotalPublicProgramEnrollmentsBySeller(sellerUid: string) {
    // Returns a document containing a coach's total lifetime program enrollments (across all programs)
    return this.db.collection(`seller-program-enrollments`)
      .doc(sellerUid)
      .valueChanges() as Observable<any>;
  }

  getPublicProgramsBySeller(sellerUid: string) {
    console.log(sellerUid);
    const programsRef = this.db.collection('public-programs', ref => ref.where('sellerUid', '==', sellerUid));
    return programsRef.valueChanges() as Observable<CoachingProgram[]>;
  }

  async deletePrivateProgram(userId: string, programId: string) {
    return this.db.collection(`users/${userId}/programs`)
      .doc(programId)
      .delete()
      .catch(err => console.error(err));
  }

  getTotalAdminProgramsInReview() {
    return this.db.collection(`admin`)
      .doc('totalProgramsInReview')
      .valueChanges() as Observable<any>;
  }

  getInitialAdminProgramsInReview(limitTo: number) {
    return this.db.collection(`admin/review-requests/programs`, ref => ref
      .orderBy('requested', 'asc')
      .limit(limitTo))
      .valueChanges({idField: 'id'}) as Observable<AdminProgramReviewRequest[]>;
  }

  getNextAdminProgramsInReview(limitTo: number, lastDoc: any) {
    return this.db.collection(`admin/review-requests/programs`, ref => ref
      .orderBy('requested', 'asc')
      .startAfter(lastDoc.requested) // must match the .orderBy field!
      .limit(limitTo))
      .valueChanges({idField: 'id'}) as Observable<AdminProgramReviewRequest[]>;
  }

  getPreviousAdminProgramsInReview(limitTo: number, firstDoc: any) {
    return this.db.collection(`admin/review-requests/programs`, ref => ref
      .orderBy('requested', 'asc')
      .endBefore(firstDoc.requested) // must match the .orderBy field!
      .limitToLast(limitTo))
      .valueChanges({idField: 'id'}) as Observable<AdminProgramReviewRequest[]>;
  }

  getPurchasedPrograms(uid: string) {
    // Returns all the user's purchased program documents along with the doc IDs.
    return this.db.collection(`users/${uid}/purchased-programs`)
      .valueChanges({idField: 'id'}) as Observable<[]>;
  }

  getUnlockedPublicProgram(programId: string) {
    // Returns a program document.
    return this.db.collection(`locked-program-content`)
      .doc(programId)
      .valueChanges() as Observable<CoachingProgram>;
  }

  // ================================================================================
  // =====                           COACH SERVICES                            ======
  // ================================================================================

  saveCoachService(uid: string, service: CoachingService) {
    return this.db.collection(`users/${uid}/services`)
      .doc(service.id)
      .set(service, {merge: true});
  }

  getCoachServices(uid: string) {
    return this.db.collection(`users/${uid}/services`)
      .valueChanges({idField: 'id'}) as Observable<CoachingService[]>;
  }

  getCoachServiceById(uid: string, serviceId: string) {
    return this.db.collection(`users/${uid}/services`)
      .doc(serviceId)
      .valueChanges() as Observable<CoachingService>;
  }

  getPublicCoachServiceById(serviceId: string) {
    return this.db.collection(`public-services`)
      .doc(serviceId)
      .valueChanges() as Observable<CoachingService>;
  }

// ================================================================================
// =====                            USER ORDERED SESSIONS                    ======
// ================================================================================

  getUserOrderedSessions(uid: string) {
    return this.db.collection(`users/${uid}/ordered-sessions`)
      .valueChanges() as Observable<any>;
  }

  getUserIsCoachSession(uid: string) {
    // console.log(uid);
    return this.db.collection(`users/${uid}/calendar`, ref => ref.where('ordered', '==', true))
      .valueChanges() as Observable<any>;
  }

  getParticularOrderedSession(roomName: string) {
    return this.db.collection(`ordered-sessions/all/sessions`).doc(roomName);
  }

// ================================================================================
// =====                            TESTING METHOD FOR DOC.REFERENCE         ======
// ================================================================================


  async getTestDocFromReference(uid) {

    return this.db.collection(`users/${uid}/calendar`).doc('1606293300000').get()
      .toPromise()
      .then(doc => {
        console.log('getted', doc.data());
        if (doc.exists) {
          return doc.data();
        } else {
          return undefined;
        }
      });

  }


}



