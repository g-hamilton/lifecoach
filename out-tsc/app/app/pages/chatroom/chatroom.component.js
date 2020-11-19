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
import { Subscription } from 'rxjs';
let ChatroomComponent = class ChatroomComponent {
    constructor(platformId, authService, analyticsService, route, router, dataService, afs) {
        this.platformId = platformId;
        this.authService = authService;
        this.analyticsService = analyticsService;
        this.route = route;
        this.router = router;
        this.dataService = dataService;
        this.afs = afs;
        this.userRooms = [];
        this.leadsSelected = true;
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
        this.route.params.subscribe(params => {
            if (!params.roomId) { // active route does not include a room ID
                // Get & load user's last active room.
                // NB: Will reload this component from a new route that includes a room ID.
                const roomSub = this.dataService.getUserRooms(uid).subscribe((data) => __awaiter(this, void 0, void 0, function* () {
                    if (data) { // user has sent at least one message and has a lastActiveRoom
                        const defaultRoom = data.lastActiveRoom ? data.lastActiveRoom : yield this.getDefaultRoom();
                        this.router.navigate(['/messages/rooms', defaultRoom]);
                    }
                    else { // user has no lastActiveRoom. Try to get a default room..
                        const defaultRoom = yield this.getDefaultRoom();
                        if (defaultRoom) {
                            this.router.navigate(['/messages/rooms', defaultRoom]);
                        }
                        else { // user has no rooms
                            this.noUserRooms = true;
                        }
                    }
                    roomSub.unsubscribe();
                }));
                this.subscriptions.add(roomSub);
            }
            else { // active route does include a room id
                this.roomID = params.roomId;
                // Reset the pagination service when the room (active route) changes
                this.paginationService = null;
                this.paginationService = new PaginationService(this.afs); // manual constructor
                // Get this room's message feed
                this.paginationService.init(`chatrooms/${this.roomID}/messages`, 'sent', {
                    reverse: true,
                    prepend: true,
                    limit: 10
                });
                // Subscribe to the message feed here in the component
                this.subscriptions.add(this.paginationService.data.subscribe(data => {
                    // Update the time this user last read a message in this room
                    const timestampPromise = this.dataService.updateUserRoomLastReadTimestamp(this.userId, this.roomID);
                    // Scroll to feed bottom
                    setTimeout(() => {
                        this.scrollToBottom();
                    }, 1000);
                }));
                // Scroll to bottom of messages on first load of the page (init)
                setTimeout(() => {
                    this.scrollToBottom();
                }, 1000);
                // Get all the rooms that this user is active in
                const roomSub = this.dataService.getAllUserRooms(uid).subscribe(data => {
                    if (data) {
                        data.sort((a, b) => parseFloat(a.lastActive) + parseFloat(b.lastActive)); // sort by last active (desc)
                        this.userRooms = data;
                        console.log(data);
                    }
                });
                this.subscriptions.add(roomSub);
                this.roomLoaded = true; // load chatroom child components
            }
        });
    }
    getUserData() {
        this.subscriptions.add(this.authService.getAuthUser()
            .subscribe(user => {
            if (user) {
                this.userId = user.uid;
                this.getRouteData(user.uid);
            }
        }));
    }
    getDefaultRoom() {
        return new Promise(resolve => {
            const roomSub = this.dataService.getAllUserRooms(this.userId).subscribe(data => {
                if (data.length > 0) {
                    data.sort((a, b) => {
                        return a.lastActive + b.lastActive;
                    });
                    resolve(data[0].roomId);
                }
                roomSub.unsubscribe();
                resolve(null);
            });
            this.subscriptions.add(roomSub);
        });
    }
    feedScrollHandler(ev) {
        // console.log(ev); // should log top or bottom
        if (ev === 'top') {
            this.paginationService.more(); // going back in time, call for older messages
        }
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    ViewChild('scrollFeed', { static: false }),
    __metadata("design:type", ElementRef)
], ChatroomComponent.prototype, "feedContainer", void 0);
ChatroomComponent = __decorate([
    Component({
        selector: 'app-chatroom',
        templateUrl: 'chatroom.component.html',
        styleUrls: ['./chatroom.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AuthService,
        AnalyticsService,
        ActivatedRoute,
        Router,
        DataService,
        AngularFirestore])
], ChatroomComponent);
export { ChatroomComponent };
//# sourceMappingURL=chatroom.component.js.map