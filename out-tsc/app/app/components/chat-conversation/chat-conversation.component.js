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
import { Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';
let ChatConversationComponent = class ChatConversationComponent {
    constructor(platformId, dataService, route, router) {
        this.platformId = platformId;
        this.dataService = dataService;
        this.route = route;
        this.router = router;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.getRouteData();
        }
    }
    ngOnChanges() {
        if (isPlatformBrowser(this.platformId)) {
            if (this.userId && this.conversation && this.conversation.roomId && this.conversation.users) {
                // Get profile names for chat participants
                const notMe = this.conversation.users.filter(uid => uid !== this.userId);
                const otherUid = notMe[0];
                this.subscriptions.add(this.dataService.getPublicCoachProfile(otherUid).subscribe(profile => {
                    if (profile) { // user is a Coach
                        this.otherUserFullName = `${profile.firstName} ${profile.lastName}`;
                        this.otherUserFirstName = profile.firstName;
                        this.otherUserAvatar = profile.photo;
                    }
                    else { // user is Regular
                        this.subscriptions.add(this.dataService.getRegularProfile(otherUid).subscribe(regProfile => {
                            if (regProfile) {
                                this.otherUserFullName = `${regProfile.firstName} ${regProfile.lastName}`;
                                this.otherUserFirstName = regProfile.firstName;
                                this.otherUserAvatar = regProfile.photo ? regProfile.photo :
                                    `https://eu.ui-avatars.com/api/?name=${regProfile.firstName}+${regProfile.lastName}`; // https://eu.ui-avatars.com/
                            }
                        }));
                    }
                }));
                // Get unread messages count
                this.getUnreadMessagesCount();
            }
        }
    }
    getDisplayDate(unix) {
        const date = new Date(unix * 1000);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = days[date.getDay()];
        return `${day} ${date.toLocaleDateString()}`;
    }
    getDisplaytime(unix) {
        return new Date(unix * 1000).toLocaleTimeString();
    }
    getRouteData() {
        this.route.params.subscribe(params => {
            this.activeRouteRoomId = params.roomId;
        });
    }
    getUnreadMessagesCount() {
        return __awaiter(this, void 0, void 0, function* () {
            this.unreadMessagesCount = yield this.dataService
                .getUserRoomUnreadMessageCount(this.conversation.roomId, this.conversation.lastRead);
        });
    }
    onRoomClick() {
        if (this.activeRouteRoomId && this.conversation.roomId && (this.conversation.roomId !== this.activeRouteRoomId)) {
            // user has clicked on a room other than the currently active room
            this.router.navigate(['/messages/rooms', this.conversation.roomId]);
        }
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], ChatConversationComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], ChatConversationComponent.prototype, "conversation", void 0);
ChatConversationComponent = __decorate([
    Component({
        selector: 'app-chat-conversation',
        templateUrl: './chat-conversation.component.html',
        styleUrls: ['./chat-conversation.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, DataService,
        ActivatedRoute,
        Router])
], ChatConversationComponent);
export { ChatConversationComponent };
//# sourceMappingURL=chat-conversation.component.js.map