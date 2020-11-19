var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
import { Component, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { DataService } from 'app/services/data.service';
import { PaginationService } from 'app/services/pagination.service';
import { SearchService } from 'app/services/search.service';
import { Subscription } from 'rxjs';
let CourseDiscussionsComponent = class CourseDiscussionsComponent {
    constructor(platformId, authService, analyticsService, route, router, dataService, afs, searchService) {
        this.platformId = platformId;
        this.authService = authService;
        this.analyticsService = analyticsService;
        this.route = route;
        this.router = router;
        this.dataService = dataService;
        this.afs = afs;
        this.searchService = searchService;
        this.userRooms = [];
        this.courseQaSelected = true;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.analyticsService.pageView();
            this.getUserData();
        }
    }
    scrollToBottom() {
        this.feedContainer.nativeElement.scrollTop = this.feedContainer.nativeElement.scrollHeight;
    }
    getRouteData(uid) {
        this.route.params.subscribe((params) => __awaiter(this, void 0, void 0, function* () {
            if (!params.roomId) { // active route does not include a room ID
                // Load the default room
                const roomId = yield this.getDefaultRoom();
                console.log(roomId);
                if (roomId) {
                    this.router.navigate(['/course-discussions/rooms', roomId]);
                }
                else { // user has no rooms
                    this.noUserRooms = true;
                }
            }
            else { // active route does include a room id
                this.roomID = params.roomId;
                // Reset the pagination service when the room (active route) changes
                this.feedPaginationService = null;
                this.feedPaginationService = new PaginationService(this.afs); // manual constructor
                // Get this room's message feed
                this.feedPaginationService.init(`public-course-questions/${this.roomID}/replies`, 'created', {
                    // where: `courseSellerId == ${this.userId}`,
                    reverse: true,
                    prepend: true,
                    limit: 10
                });
                // Subscribe to the message feed here in the component
                this.subscriptions.add(this.feedPaginationService.data.subscribe(data => {
                    console.log('Feed results:', data);
                    // Update the time this user last read a message in this room
                    // const timestampPromise = this.dataService.updateUserRoomLastReadTimestamp(this.userId, this.roomID);
                    // Scroll to feed bottom
                    setTimeout(() => {
                        this.scrollToBottom();
                    }, 1000);
                }));
                // Scroll to bottom of messages on first load of the page (init)
                setTimeout(() => {
                    this.scrollToBottom();
                }, 1000);
                // Get this user's discussions
                // Reset the pagination service when the room (active route) changes
                this.roomPaginationService = null;
                this.roomPaginationService = new PaginationService(this.afs); // manual constructor
                this.roomPaginationService.init(`public-course-questions`, 'created', {
                    where: `courseSellerId == ${this.userId}`,
                    reverse: true,
                    prepend: true,
                    limit: 10
                });
                // Subscribe to the rooms feed here in the component
                this.subscriptions.add(this.roomPaginationService.data.subscribe(data => {
                    console.log('Room results:', data);
                    this.userRooms = data;
                }));
                this.roomLoaded = true; // load chatroom child components
            }
        }));
    }
    getUserData() {
        this.subscriptions.add(this.authService.getAuthUser()
            .subscribe(user => {
            if (user) {
                this.userId = user.uid;
                this.getRouteData(user.uid);
                this.getUserProfile();
            }
        }));
    }
    getUserProfile() {
        const tempSub = this.dataService.getPublicCoachProfile(this.userId).subscribe(coachProfile => {
            // console.log(coachProfile);
            if (coachProfile) {
                this.userProfile = coachProfile;
            }
            tempSub.unsubscribe();
        });
        this.subscriptions.add(tempSub);
    }
    getDefaultRoom() {
        return __awaiter(this, void 0, void 0, function* () {
            /*
                Looks for all questions in all courses for the user.
                Returns the most recent question id, or null if no questions found.
                Sort by most recent date setting is set in Algolia so no sort needed here.
            */
            const filters = {
                facets: {
                    courseSellerId: this.userId,
                    type: 'course'
                }
            };
            const res = yield this.searchService.searchCourseQuestions(1, 1, filters); // only need 1 result
            if (res && res.hits && res.hits.length) {
                return res.hits[0].objectID;
            }
            return null;
        });
    }
    roomScrollHandler(ev) {
        // console.log(ev); // should log top or bottom
        if (ev === 'top') {
            this.roomPaginationService.more(); // going back in time, call for older messages
        }
    }
    feedScrollHandler(ev) {
        // console.log(ev); // should log top or bottom
        if (ev === 'top') {
            this.feedPaginationService.more(); // going back in time, call for older messages
        }
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    ViewChild('scrollFeed', { static: false }),
    __metadata("design:type", ElementRef)
], CourseDiscussionsComponent.prototype, "feedContainer", void 0);
CourseDiscussionsComponent = __decorate([
    Component({
        selector: 'app-course-discussions',
        templateUrl: 'course.discussions.component.html',
        styleUrls: ['./course.discussions.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AuthService,
        AnalyticsService,
        ActivatedRoute,
        Router,
        DataService,
        AngularFirestore,
        SearchService])
], CourseDiscussionsComponent);
export { CourseDiscussionsComponent };
//# sourceMappingURL=course.discussions.component.js.map