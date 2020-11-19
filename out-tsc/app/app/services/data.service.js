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
import { AnalyticsService } from './analytics.service';
import { first } from 'rxjs/operators';
let DataService = class DataService {
    constructor(db, analyticsService) {
        this.db = db;
        this.analyticsService = analyticsService;
    }
    // ================================================================================
    // =====                        USER TASKS / TODOS                           ======
    // ================================================================================
    getUserTasksTodos(uid) {
        return this.db.collection(`users/${uid}/tasks-todo`)
            .valueChanges();
    }
    deleteUserTaskTodo(uid, taskId) {
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
    completeUserTask(uid, taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            const tempSub = this.getUserTasksTodos(uid)
                .pipe(first())
                .subscribe(todos => {
                if (todos) {
                    todos.forEach(task => {
                        if (task.id === taskId) {
                            return this.db.collection(`users/${uid}/tasks-complete`)
                                .doc(taskId)
                                .set(task, { merge: true });
                        }
                    });
                    this.deleteUserTaskTodo(uid, taskId);
                }
                tempSub.unsubscribe();
            });
        });
    }
    // ================================================================================
    // =====                           USER PROFILES                             ======
    // ================================================================================
    saveCoachProfile(uid, profile) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`users/${uid}/profile`)
                .doc(`profile${uid}`)
                .set(profile, { merge: true })
                .catch(err => console.error(err));
        });
    }
    getCoachProfile(uid) {
        return this.db.collection(`users/${uid}/profile`)
            .doc(`profile${uid}`)
            .valueChanges();
    }
    getPublicCoachProfile(uid) {
        return this.db.collection(`public-coaches`)
            .doc(`${uid}`)
            .valueChanges();
    }
    getRegularProfile(uid) {
        return this.db.collection(`users/${uid}/regularProfile`)
            .doc(`profile${uid}`)
            .valueChanges();
    }
    // ================================================================================
    // =====                            USER ACCOUNTS                            ======
    // ================================================================================
    getUserAccount(uid) {
        return this.db.collection(`users/${uid}/account`)
            .doc(`account${uid}`)
            .valueChanges();
    }
    updateUserAccount(uid, partial) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`users/${uid}/account`)
                .doc(`account${uid}`)
                .update(partial)
                .catch(err => console.error(err));
        });
    }
    // ================================================================================
    // =====                           USER MESSAGES                             ======
    // ================================================================================
    getUserRooms(uid) {
        // Returns just the userRooms document with the lastActiveRoom property on it.
        return this.db.collection(`userRooms`)
            .doc(uid)
            .valueChanges();
    }
    getAllUserRooms(uid) {
        // Returns all the user's current chat rooms.
        return this.db.collection(`userRooms/${uid}/rooms`)
            .valueChanges();
    }
    // NB: This method will return a chat feed in realtime but it won't paginate data.
    // For pagination, use the pagination.service.ts instead.
    getRoomFeed(roomId) {
        return this.db.collection(`chatrooms/${roomId}/messages`, ref => ref
            .limitToLast(25)
            .orderBy('sent', 'asc'))
            .valueChanges();
    }
    updateUserRoomLastReadTimestamp(uid, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`userRooms/${uid}/rooms`)
                .doc(roomId)
                .set({
                lastRead: Math.round(new Date().getTime() / 1000) // unix timestamp
            }, { merge: true })
                .catch(err => console.error(err));
        });
    }
    getUserRoomUnreadMessageCount(roomId, lastRead) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                if (lastRead) { // the room has been read by the user
                    const snap = this.db.collection(`chatrooms/${roomId}/messages`, ref => ref
                        .where('sent', '>', lastRead))
                        .get();
                    snap.pipe(first()).subscribe(data => {
                        resolve(data.size);
                    });
                }
                else { // the room has never been read by the user
                    const snap = this.db.collection(`chatrooms/${roomId}/messages`)
                        .get();
                    snap.pipe(first()).subscribe(data => {
                        resolve(data.size);
                    });
                }
            });
        });
    }
    // ================================================================================
    // =====                        USER PROFILE VIDEO                           ======
    // ================================================================================
    getProfileVideos(uid) {
        // Returns all the user's saved profile video documents along with the doc IDs.
        return this.db.collection(`users/${uid}/profileVideos`)
            .valueChanges({ idField: 'id' });
    }
    deleteProfileVideoData(uid, docId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`users/${uid}/profileVideos`)
                .doc(docId)
                .delete()
                .catch(err => console.error(err));
        });
    }
    // ================================================================================
    // =====                            USER COURSES                             ======
    // ================================================================================
    getPublicCourse(courseId) {
        // Returns a course document.
        return this.db.collection(`public-courses`)
            .doc(courseId)
            .valueChanges();
    }
    getUnlockedPublicCourse(courseId) {
        // Returns a course document.
        return this.db.collection(`locked-course-content`)
            .doc(courseId)
            .valueChanges();
    }
    getPublicCoursesBySeller(sellerUid) {
        const coursesRef = this.db.collection('public-courses', ref => ref.where('sellerUid', '==', sellerUid));
        return coursesRef.valueChanges();
    }
    getPrivateCourse(userId, courseId) {
        // Returns a course document.
        return this.db.collection(`users/${userId}/courses`)
            .doc(courseId)
            .valueChanges();
    }
    getPurchasedCourses(uid) {
        // Returns all the user's purchased course documents along with the doc IDs.
        return this.db.collection(`users/${uid}/purchased-courses`)
            .valueChanges({ idField: 'id' });
    }
    getPrivateCourses(uid) {
        // Returns all the user's created courses (as seller) documents.
        return this.db.collection(`users/${uid}/courses`)
            .valueChanges();
    }
    getCourseSalesByMonth(uid, month, year, courseId) {
        // Returns all the user's course sales documents for month and year, along with the doc IDs.
        return this.db.collection(`users/${uid}/sales/${month}-${year}/${courseId}`)
            .valueChanges({ idField: 'id' });
    }
    getLifetimeTotalCourseSales(uid, courseId) {
        // Returns a document containing lifetime sales totals.
        return this.db.collection(`users/${uid}/sales/total-lifetime-course-sales/courses`)
            .doc(courseId)
            .valueChanges();
    }
    getTotalPublicEnrollmentsByCourse(courseId) {
        // Returns a document containing a courses total lifetime enrollments
        return this.db.collection(`course-enrollments`)
            .doc(courseId)
            .valueChanges();
    }
    getTotalPublicEnrollmentsByCourseSeller(sellerUid) {
        // Returns a document containing a courses total lifetime enrollments
        return this.db.collection(`seller-course-enrollments`)
            .doc(sellerUid)
            .valueChanges();
    }
    savePrivateCourse(uid, course) {
        return __awaiter(this, void 0, void 0, function* () {
            // track
            this.analyticsService.saveCourse();
            // Saves a user's course to a document with matching id
            return this.db.collection(`users/${uid}/courses`)
                .doc(course.courseId)
                .set(course, { merge: true })
                .catch(err => console.error(err));
        });
    }
    getUserCourseLibraryTotals(userId) {
        return this.db.collection(`users/${userId}/courseLibrary/totals/items`)
            .doc('itemTotals')
            .valueChanges();
    }
    getInitialCourseLibraryItems(userId, limitTo) {
        return this.db.collection(`users/${userId}/courseLibrary`, ref => ref
            .orderBy('lastUploaded', 'desc')
            .limit(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getNextCourseLibraryItems(userId, limitTo, lastDoc) {
        // console.log('lastdoc:', lastDoc);
        return this.db.collection(`users/${userId}/courseLibrary`, ref => ref
            .orderBy('lastUploaded', 'desc')
            .startAfter(lastDoc.lastUploaded) // must match the .orderBy field!
            .limit(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getPreviousCourseLibraryItems(userId, limitTo, firstDoc) {
        // console.log('firstdoc:', firstDoc);
        return this.db.collection(`users/${userId}/courseLibrary`, ref => ref
            .orderBy('lastUploaded', 'desc')
            .endBefore(firstDoc.lastUploaded) // must match the .orderBy field!
            .limitToLast(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getCourseReviewRequest(courseId) {
        return this.db.collection(`admin/review-requests/courses`)
            .doc(courseId)
            .valueChanges();
    }
    requestCourseReview(course) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!course.sellerUid) {
                console.error('Unable to request review: no seller UID');
                return;
            }
            if (!course.courseId) {
                console.error('Unable to request review: no course ID');
                return;
            }
            const requestDate = Math.round(new Date().getTime() / 1000); // set unix timestamp
            const reviewRequest = {
                courseId: course.courseId,
                sellerUid: course.sellerUid,
                requested: requestDate,
                status: 'submitted'
            };
            yield this.db.collection(`admin/review-requests/courses`)
                .doc(course.courseId)
                .set(reviewRequest, { merge: true })
                .catch(err => console.error(err));
            return this.db.collection(`users/${course.sellerUid}/courses`)
                .doc(course.courseId)
                .set({ reviewRequest }, { merge: true })
                .catch(err => console.error(err));
        });
    }
    getTotalAdminCoursesInReview() {
        return this.db.collection(`admin`)
            .doc('totalCoursesInReview')
            .valueChanges();
    }
    getInitialAdminCoursesInReview(limitTo) {
        return this.db.collection(`admin/review-requests/courses`, ref => ref
            .orderBy('requested', 'asc')
            .limit(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getNextAdminCoursesInReview(limitTo, lastDoc) {
        return this.db.collection(`admin/review-requests/courses`, ref => ref
            .orderBy('requested', 'asc')
            .startAfter(lastDoc.requested) // must match the .orderBy field!
            .limit(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getPreviousAdminCoursesInReview(limitTo, firstDoc) {
        return this.db.collection(`admin/review-requests/courses`, ref => ref
            .orderBy('requested', 'asc')
            .endBefore(firstDoc.requested) // must match the .orderBy field!
            .limitToLast(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getPrivateCourseLecturesComplete(userId, courseId) {
        return this.db.collection(`users/${userId}/purchased-courses/${courseId}/lectures-complete`)
            .valueChanges({ idField: 'id' });
    }
    savePrivateLectureComplete(userId, courseId, lectureId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`users/${userId}/purchased-courses/${courseId}/lectures-complete`)
                .doc(lectureId)
                .set({ id: lectureId }, { merge: true })
                .catch(err => console.error(err));
        });
    }
    savePrivateLectureIncomplete(userId, courseId, lectureId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`users/${userId}/purchased-courses/${courseId}/lectures-complete`)
                .doc(lectureId)
                .delete()
                .catch(err => console.error(err));
        });
    }
    savePrivateCourseBookmark(bookmark) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`users/${bookmark.userId}/bookmarks`)
                .doc(`${bookmark.courseId}_${bookmark.lastUpdated}`)
                .set(bookmark, { merge: true })
                .catch(err => console.error(err));
        });
    }
    getPrivateBookmarksByCourse(userId, courseId) {
        const bookmarksRef = this.db.collection(`users/${userId}/bookmarks`, ref => ref
            .where('courseId', '==', courseId));
        return bookmarksRef.valueChanges({ idField: 'id' });
    }
    deletePrivateCourseBookmark(bookmark) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`users/${bookmark.userId}/bookmarks`)
                .doc(`${bookmark.courseId}_${bookmark.lastUpdated}`)
                .delete()
                .catch(err => console.error(err));
        });
    }
    saveCourseQuestion(question) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`public-course-questions`)
                .doc(question.id)
                .set(question, { merge: true })
                .catch(err => console.error(err));
        });
    }
    saveCourseReply(reply) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`public-course-questions/${reply.questionId}/replies`)
                .doc(reply.id)
                .set(reply, { merge: true })
                .catch(err => console.error(err));
        });
    }
    getInitialCourseQuestions(courseId, limitTo) {
        return this.db.collection(`public-course-questions`, ref => ref
            .where('courseId', '==', courseId)
            .orderBy('created', 'desc')
            .limit(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getNextCourseQuestions(courseId, limitTo, lastDoc) {
        // console.log('lastdoc:', lastDoc);
        return this.db.collection(`public-course-questions`, ref => ref
            .where('courseId', '==', courseId)
            .orderBy('created', 'desc')
            .startAfter(lastDoc.created) // must match the .orderBy field!
            .limit(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getPreviousCourseQuestions(courseId, limitTo, firstDoc) {
        // console.log('firstdoc:', firstDoc);
        return this.db.collection(`public-course-questions`, ref => ref
            .where('courseId', '==', courseId)
            .orderBy('created', 'desc')
            .endBefore(firstDoc.created) // must match the .orderBy field!
            .limitToLast(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getInitialQuestionReplies(questionId, limitTo) {
        return this.db.collection(`public-course-questions/${questionId}/replies`, ref => ref
            .orderBy('created', 'asc')
            .limit(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getNextQuestionReplies(questionId, limitTo, lastDoc) {
        // console.log('lastdoc:', lastDoc);
        return this.db.collection(`public-course-questions/${questionId}/replies`, ref => ref
            .orderBy('created', 'asc')
            .startAfter(lastDoc.created) // must match the .orderBy field!
            .limit(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getPreviousQuestionReplies(questionId, limitTo, firstDoc) {
        // console.log('firstdoc:', firstDoc);
        return this.db.collection(`public-course-questions/${questionId}/replies`, ref => ref
            .orderBy('created', 'asc')
            .endBefore(firstDoc.created) // must match the .orderBy field!
            .limitToLast(limitTo))
            .valueChanges({ idField: 'id' });
    }
    getCourseQuestionById(questionId) {
        return this.db.collection(`public-course-questions`)
            .doc(questionId)
            .valueChanges();
    }
    upVoteCourseQuestion(question, userId) {
        return this.db.collection(`public-course-questions/${question.id}/upvotes`)
            .doc(userId)
            .set({ upvotedBy: userId }, { merge: true });
    }
    upVoteCourseQuestionReply(reply, userId) {
        return this.db.collection(`public-course-questions/${reply.questionId}/replies/${reply.id}/upvotes`)
            .doc(userId)
            .set({ upvotedBy: userId }, { merge: true });
    }
    deletePrivateCourse(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`users/${userId}/courses`)
                .doc(courseId)
                .delete()
                .catch(err => console.error(err));
        });
    }
    markCourseCompleteForUser(userId, course) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestampNow = Math.round(new Date().getTime() / 1000);
            // mark the course as complete for this user
            yield this.db.collection(`users/${userId}/courses-complete`)
                .doc(course.courseId)
                .set({ completed: timestampNow })
                .catch(err => console.error(err));
            // save the action to this person's history for the course creator
            return this.db.collection(`users/${course.sellerUid}/people/${userId}/history`)
                .doc(timestampNow.toString())
                .set({ action: 'completed_self_study_course' });
        });
    }
    getUserCoursesComplete(userId) {
        return this.db.collection(`users/${userId}/courses-complete`)
            .valueChanges({ idField: 'id' });
    }
    // ================================================================================
    // =====                          RATES / CURRENCY                           ======
    // ================================================================================
    getPlatformRates() {
        // Returns a rates document.
        return this.db.collection(`currency`)
            .doc('rates')
            .valueChanges();
    }
    // ================================================================================
    // =====                          PAYMENT HISTORY                            ======
    // ================================================================================
    getSuccessfulPayments(uid) {
        // Returns all the user's successful payment documents along with the doc IDs.
        return this.db.collection(`users/${uid}/account/account${uid}/successful-payments`)
            .valueChanges({ idField: 'id' });
    }
    getFailedPayments(uid) {
        // Returns all the user's successful payment documents along with the doc IDs.
        return this.db.collection(`users/${uid}/account/account${uid}/failed-payments`)
            .valueChanges({ idField: 'id' });
    }
    getSuccessfulPaymentIntent(userId, paymentIntentId) {
        // Returns a successful Stripe payment intent document.
        return this.db.collection(`users/${userId}/account/account${userId}/successful-payments`)
            .doc(paymentIntentId)
            .valueChanges();
    }
    // ================================================================================
    // =====                              REFUNDS                                ======
    // ================================================================================
    getUserRefunds(uid) {
        // Returns all the user's refund documents along with the doc IDs.
        return this.db.collection(`users/${uid}/account/account${uid}/refunds`)
            .valueChanges({ idField: 'id' });
    }
    // ================================================================================
    // =====                          CALENDAR EVENTS                            ======
    // ================================================================================
    dateToKeyHelper(date) {
        const temp = new Date(date);
        const today = temp.getDay();
        temp.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(temp.getTime() - 86400000 * today);
        const endOfWeek = new Date(temp.getTime() + 86400000 * (6 - today));
        return `${startOfWeek.getFullYear()}-${startOfWeek.getMonth()}-${startOfWeek.getDate()}-${endOfWeek.getFullYear()}-${endOfWeek.getMonth()}-${endOfWeek.getDate()}`;
    }
    saveUserCalendarEvent(uid, date, event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`users/${uid}/calendar`)
                .doc(event.start.getTime().toString())
                .set(event)
                .catch(err => console.error(err));
        });
    }
    getUserCalendarEvents(uid, date) {
        return this.db.collection(`users/${uid}/calendar`)
            // ref => ref.where('__name__', '>', '1604359800000')
            //         .where('__name__', '<', '1604458500000')
            .valueChanges();
    }
    // This is redundant and it will be reworked in a final version of app, but now we need it to control session duration changes
    hasUserEvents(uid) {
        return this.db.collection(`users/${uid}/calendar`)
            .get()
            .toPromise()
            .then(querySnapshot => querySnapshot.size > 0);
    }
    //
    uploadOrder(uid, coachId, id) {
        return __awaiter(this, void 0, void 0, function* () {
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
                        console.log('Successfull');
                        // Write this task to the temporary-reserved-tasks table
                        this.db.collection(`temporary-reserved-events`).add({
                            calendarId: id,
                            coachId,
                            timeOfReserve: Date.now()
                        }).then(docRef => console.log(docRef.id))
                            .catch(err => console.log(err));
                    })
                        .catch(err => console.log(err));
                }
                else {
                    console.log('This event is not available');
                    return null;
                }
            });
        });
    }
    //
    getUserNotReservedEvents(uid) {
        return this.db.collection(`users/${uid}/calendar`, ref => ref.where('reserved', '==', false))
            .valueChanges();
    }
    deleteUserCalendarEvent(uid, date) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection(`users/${uid}/calendar`)
                .doc(date.getTime().toString())
                .delete()
                .catch(err => console.error(err));
        });
    }
    // ================================================================================
    // =====                            PEOPLE (CRM)                             ======
    // ================================================================================
    getUserPeople(uid) {
        return this.db.collection(`users/${uid}/people`)
            .valueChanges({ idField: 'id' });
    }
    getUserPersonHistory(uid, personUid) {
        return this.db.collection(`users/${uid}/people/${personUid}/history`)
            .valueChanges({ idField: 'id' });
    }
    getUserPerson(uid, personUid) {
        return this.db.collection(`users/${uid}/people`)
            .doc(personUid)
            .valueChanges();
    }
    // ================================================================================
    // =====                           COACH SERVICES                            ======
    // ================================================================================
    saveCoachService(uid, service) {
        return this.db.collection(`users/${uid}/services`)
            .doc(service.id)
            .set(service, { merge: true });
    }
    getCoachServices(uid) {
        return this.db.collection(`users/${uid}/services`)
            .valueChanges({ idField: 'id' });
    }
    getCoachServiceById(uid, serviceId) {
        return this.db.collection(`users/${uid}/services`)
            .doc(serviceId)
            .valueChanges();
    }
    getPublicCoachServiceById(serviceId) {
        return this.db.collection(`public-services`)
            .doc(serviceId)
            .valueChanges();
    }
};
DataService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [AngularFirestore,
        AnalyticsService])
], DataService);
export { DataService };
//# sourceMappingURL=data.service.js.map