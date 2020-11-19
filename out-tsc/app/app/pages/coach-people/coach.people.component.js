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
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
let CoachPeopleComponent = class CoachPeopleComponent {
    constructor(platformId, authService, dataService, router) {
        this.platformId = platformId;
        this.authService = authService;
        this.dataService = dataService;
        this.router = router;
        this.people = [];
        this.roomSubscriptions = {};
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.getUserData();
        }
    }
    getUserData() {
        this.subscriptions.add(this.authService.getAuthUser().subscribe(user => {
            if (user) {
                this.userId = user.uid;
                this.loadPeople();
            }
        }));
    }
    loadPeople() {
        this.subscriptions.add(this.dataService.getUserPeople(this.userId).subscribe((people) => __awaiter(this, void 0, void 0, function* () {
            if (people) {
                console.log('people:', people);
                const filledPeople = [];
                for (const p of people) {
                    const person = yield this.getPersonData(p.id);
                    if (person) {
                        person.id = p.id;
                        person.created = new Date(p.created * 1000); // convert from unix to Date
                        person.lastReplyReceived = p.lastReplyReceived ? p.lastReplyReceived : null;
                        const history = yield this.getPersonHistory(this.userId, p.id);
                        if (history) {
                            person.history = history;
                        }
                        person.type = (yield this.getPersonType(person));
                        person.status = (yield this.getPersonStatus(person));
                        filledPeople.push(person);
                    }
                }
                this.people = filledPeople;
                console.log('filled people:', this.people);
            }
        })));
    }
    getPersonData(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                this.subscriptions.add(this.dataService.getRegularProfile(uid).subscribe(profile => {
                    if (profile) {
                        const person = {
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            email: profile.email,
                            photo: profile.photo ? profile.photo : `https://eu.ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}` // https://eu.ui-avatars.com/
                        };
                        resolve(person);
                    }
                    else {
                        resolve(null);
                    }
                }));
            });
        });
    }
    getPersonHistory(uid, personUid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                this.subscriptions.add(this.dataService.getUserPersonHistory(uid, personUid).subscribe(history => {
                    if (history) {
                        resolve(history);
                    }
                    else {
                        resolve(null);
                    }
                }));
            });
        });
    }
    getPersonType(person) {
        return new Promise(resolve => {
            const lastAction = person.history[person.history.length - 1].action;
            let type;
            switch (lastAction) {
                case 'sent_first_message':
                    type = this.isPersonWarm(person) ? 'warm lead' : 'lead';
                    break;
                case 'enrolled_in_self_study_course':
                    type = 'client';
                    break;
                default:
                    type = 'lead';
            }
            resolve(type);
        });
    }
    isPersonWarm(person) {
        // check if a lead is warm
        // a warm lead is less than 7 days old
        const personCreatedUnix = Math.round(person.created.getTime() / 1000);
        const nowUnix = Math.round(new Date().getTime() / 1000);
        const warmLimitDays = 7;
        const warmLimit = 60 * 60 * 1000 * 24 * warmLimitDays;
        if (!person.lastReplyReceived && person.created) {
            if (personCreatedUnix > (nowUnix - warmLimit)) {
                return true; // the first lead was received in the last 7 days
            }
        }
        if (Number(person.lastReplyReceived) > (nowUnix - warmLimit)) {
            return true; // the user responded in the last 7 days
        }
        return false;
    }
    getPersonStatus(person) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const lastAction = person.history[person.history.length - 1].action;
            let status;
            switch (lastAction) {
                case 'sent_first_message':
                    status = (yield this.getMsgStatus(person.history[person.history.length - 1].roomId));
                    break;
                case 'enrolled_in_self_study_course':
                    status = 'Enrolled in self-study course';
                    break;
                default:
                    status = 'Message';
            }
            resolve(status);
        }));
    }
    getMsgStatus(roomId) {
        return new Promise(resolve => {
            this.subscriptions.add(this.dataService.getRoomFeed(roomId).subscribe(feed => {
                const lastMsg = feed[feed.length - 1];
                if (feed.length === 1) {
                    resolve('Awaiting reply');
                }
                else if (lastMsg.from === this.userId) {
                    resolve('Responded');
                }
                else {
                    resolve('Client responded');
                }
            }));
        });
    }
    openMessage(roomId) {
        this.router.navigate(['/messages', 'rooms', roomId]);
    }
    openHistory(person) {
        this.router.navigate(['/person-history', person.id]);
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
CoachPeopleComponent = __decorate([
    Component({
        selector: 'app-coach-people',
        templateUrl: 'coach.people.component.html',
        styleUrls: ['./coach.people.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AuthService,
        DataService,
        Router])
], CoachPeopleComponent);
export { CoachPeopleComponent };
//# sourceMappingURL=coach.people.component.js.map