var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, EventEmitter } from '@angular/core';
/*
  Note: Using the NGB-Bootstrap Pagination component in the UI to handle pagination.
  https://valor-software.com/ngx-bootstrap/#/pagination
  This component takes inputs to model the UI on.
  When the user updates the UI the component emits the new page value.
*/
let NavigatorComponent = class NavigatorComponent {
    constructor() {
        this.messageEvent = new EventEmitter();
    }
    ngOnInit() { }
    pageChanged(event) {
        this.messageEvent.emit(event.page);
    }
};
__decorate([
    Input(),
    __metadata("design:type", Number)
], NavigatorComponent.prototype, "page", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], NavigatorComponent.prototype, "totalItems", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], NavigatorComponent.prototype, "itemsPerPage", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], NavigatorComponent.prototype, "maxSize", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], NavigatorComponent.prototype, "messageEvent", void 0);
NavigatorComponent = __decorate([
    Component({
        selector: 'app-navigator',
        templateUrl: './navigator.component.html',
        styleUrls: ['./navigator.component.scss']
    }),
    __metadata("design:paramtypes", [])
], NavigatorComponent);
export { NavigatorComponent };
//# sourceMappingURL=navigator.component.js.map