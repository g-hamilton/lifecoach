var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
let CourseBotlinksComponent = class CourseBotlinksComponent {
    constructor() { }
    ngOnInit() {
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseBotlinksComponent.prototype, "filters", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseBotlinksComponent.prototype, "categories", void 0);
CourseBotlinksComponent = __decorate([
    Component({
        selector: 'app-course-botlinks',
        templateUrl: './course-botlinks.component.html',
        styleUrls: ['./course-botlinks.component.scss']
    }),
    __metadata("design:paramtypes", [])
], CourseBotlinksComponent);
export { CourseBotlinksComponent };
//# sourceMappingURL=course-botlinks.component.js.map