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
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
let CourseLecturesNavigatorComponent = class CourseLecturesNavigatorComponent {
    constructor(dataService, alertService, analyticsService, router, route) {
        this.dataService = dataService;
        this.alertService = alertService;
        this.analyticsService = analyticsService;
        this.router = router;
        this.route = route;
        this.courseUpdateEvent = new EventEmitter();
        this.truncate = (input, max) => input.length > max ? `${input.substring(0, max)}...` : input;
    }
    ngOnInit() {
        this.route.queryParams.subscribe(qP => {
            if (qP.targetUser) { // We're editing course as an Admin on behalf of a user
                this.targetUserUid = qP.targetUser;
            }
        });
    }
    get allLectureLists() {
        const arr = [];
        if (this.course) {
            this.course.sections.forEach((s, i) => {
                arr.push('lectureList' + i);
            });
        }
        return arr;
    }
    onSectionDrop(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(ev);
            // re-order dropped element
            const removedElement = this.course.sections.splice(ev.previousIndex, 1)[0];
            this.course.sections.splice(ev.currentIndex, 0, removedElement);
            this.autoSaveCourse();
        });
    }
    onLectureDrop(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(ev);
            // re-order dropped element
            const removedElement = this.course.sections[ev.previousContainer.id.slice(11)].lectures.splice(ev.previousIndex, 1)[0];
            this.course.sections[ev.container.id.slice(11)].lectures.splice(ev.currentIndex, 0, removedElement);
            this.autoSaveCourse();
        });
    }
    onAddNewLecture() {
        this.analyticsService.clickCreateCourseLecture();
    }
    onAddNewSection() {
        this.analyticsService.clickCreateCourseSection();
    }
    autoSaveCourse() {
        return __awaiter(this, void 0, void 0, function* () {
            // Autosave the course object
            const saveCourse = JSON.parse(JSON.stringify(this.course)); // clone to avoid var reference issues
            yield this.dataService.savePrivateCourse(this.course.sellerUid, saveCourse);
        });
    }
    confirmDeleteSection(section, index) {
        return __awaiter(this, void 0, void 0, function* () {
            // Sections must be empty before delete
            if (section.lectures && section.lectures.length > 0) { // not empty!
                this.alertService.alert('warning-message', 'Just a second!', 'This section still has lectures in it. Please move or delete all lectures to proceed.');
            }
            else { // safe to delete
                // confirm with user
                const res = yield this.alertService.alert('warning-message-and-confirmation', 'Delete section?', 'Are you sure you want to delete this section?');
                if (res && res.action) { // user confirmed, proceed with delete section
                    this.course.sections.splice(index, 1);
                    this.autoSaveCourse();
                    this.analyticsService.deleteCourseSection();
                }
            }
        });
    }
    confirmDeleteLecture(sectionIndex, lecturesIndex, lecture) {
        return __awaiter(this, void 0, void 0, function* () {
            // confirm with user
            const res = yield this.alertService.alert('warning-message-and-confirmation', 'Delete lecture?', 'Are you sure you want to delete this lecture?');
            if (res && res.action) { // user confirmed, proceed with delete lecture
                this.course.sections[sectionIndex].lectures.splice(lecturesIndex, 1); // remove associated lecture id from section
                const i = this.course.lectures.findIndex(item => item.id === lecture.id);
                if (i !== -1) {
                    this.course.lectures.splice(i, 1);
                }
                this.autoSaveCourse();
                this.analyticsService.deleteCourseLecture();
                // navigate away from 'old' activated lecture id
                this.router.navigate(['/my-courses', this.course.courseId, 'content', 'section', this.course.sections[sectionIndex].id], { queryParams: { targetUser: this.targetUserUid } });
            }
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseLecturesNavigatorComponent.prototype, "course", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], CourseLecturesNavigatorComponent.prototype, "courseUpdateEvent", void 0);
CourseLecturesNavigatorComponent = __decorate([
    Component({
        selector: 'app-course-lectures-navigator',
        templateUrl: './course-lectures-navigator.component.html',
        styleUrls: ['./course-lectures-navigator.component.scss']
    }),
    __metadata("design:paramtypes", [DataService,
        AlertService,
        AnalyticsService,
        Router,
        ActivatedRoute])
], CourseLecturesNavigatorComponent);
export { CourseLecturesNavigatorComponent };
//# sourceMappingURL=course-lectures-navigator.component.js.map