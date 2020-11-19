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
import { Component, Input } from '@angular/core';
import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
let CourseMoreComponent = class CourseMoreComponent {
    constructor(alertService, dataService, route, router) {
        this.alertService = alertService;
        this.dataService = dataService;
        this.route = route;
        this.router = router;
    }
    ngOnInit() {
        this.route.queryParams.subscribe(qP => {
            if (qP.targetUser) { // We're editing course as an Admin on behalf of a user
                this.editingAsAdmin = true;
            }
        });
    }
    onDeleteCourse() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.alertService.alert('warning-message-and-confirmation', 'Are you sure?', 'Deleting your course is final. It CANNOT BE UNDONE! Note: Any students who have already purchased/enrolled in this course will still have access.', 'Yes - Delete');
            if (res && res.action) { // user confirms
                console.log('User confirms delete');
                this.dataService.deletePrivateCourse(this.userId, this.course.courseId);
                this.alertService.alert('success-message', 'Success!', 'Your course has been deleted.');
                if (this.editingAsAdmin) {
                    this.router.navigate(['/admin-manage-user', this.userId]);
                }
                else {
                    this.router.navigate(['/my-courses']);
                }
            }
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseMoreComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseMoreComponent.prototype, "course", void 0);
CourseMoreComponent = __decorate([
    Component({
        selector: 'app-course-more',
        templateUrl: './course-more.component.html',
        styleUrls: ['./course-more.component.scss']
    }),
    __metadata("design:paramtypes", [AlertService,
        DataService,
        ActivatedRoute,
        Router])
], CourseMoreComponent);
export { CourseMoreComponent };
//# sourceMappingURL=course-more.component.js.map