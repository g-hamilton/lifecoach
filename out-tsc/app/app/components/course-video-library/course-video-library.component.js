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
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { Subscription } from 'rxjs';
/*
  Note: Using the NGB-Bootstrap Pagination component in the UI to handle pagination.
  https://valor-software.com/ngx-bootstrap/#/pagination

  This component is called 'Course Video Library' but it has expanded to cover
  multiple file types (not just videos)!
*/
let CourseVideoLibraryComponent = class CourseVideoLibraryComponent {
    constructor(dataService, alertService) {
        this.dataService = dataService;
        this.alertService = alertService;
        this.messageEvent = new EventEmitter();
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        console.log('Selected items:', this.selectedItems);
        this.page = 1;
        this.itemsPerPage = 10;
        this.maxSize = 6;
        this.getTotalItems();
        this.loadInitialResults();
    }
    getTotalItems() {
        if (!this.userId) {
            this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot fetch library total items.');
            return;
        }
        this.subscriptions.add(this.dataService.getUserCourseLibraryTotals(this.userId).subscribe(lib => {
            if (lib && lib.totalItems) {
                this.totalItems = lib.totalItems;
            }
        }));
    }
    loadInitialResults() {
        if (!this.userId) {
            this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot fetch library initial results.');
            return;
        }
        this.subscriptions.add(this.dataService.getInitialCourseLibraryItems(this.userId, this.itemsPerPage).subscribe(items => {
            console.log('Initial library results:', items);
            if (items.length) {
                this.results = items;
            }
        }));
    }
    loadNextResults() {
        if (!this.userId) {
            this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot fetch next library results.');
            return;
        }
        const lastDoc = this.results[this.results.length - 1];
        this.subscriptions.add(this.dataService.getNextCourseLibraryItems(this.userId, this.itemsPerPage, lastDoc).subscribe(items => {
            console.log('Next library results:', items);
            if (items.length) {
                this.results = items;
            }
        }));
    }
    loadPreviousResults() {
        if (!this.userId) {
            this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot fetch previous library results.');
            return;
        }
        const firstDoc = this.results[0];
        this.subscriptions.add(this.dataService.getPreviousCourseLibraryItems(this.userId, this.itemsPerPage, firstDoc).subscribe(items => {
            console.log('Previous library results:', items);
            if (items.length) {
                this.results = items;
            }
        }));
    }
    pageChanged(event) {
        console.log(event.page);
        const requestedPage = event.page;
        if (requestedPage > this.page) { // we're going forwards
            this.loadNextResults();
            this.page = requestedPage;
        }
        else if (requestedPage < this.page) { // we're going backwards
            this.loadPreviousResults();
            this.page = requestedPage;
        }
    }
    onLibraryItemSelect(index) {
        this.messageEvent.emit(this.results[index]);
        if (!this.selectedItems) {
            this.selectedItems = [];
        }
        this.selectedItems.push(this.results[index]);
    }
    isAlreadySelected(index) {
        let selected = false;
        if (!this.selectedItems) {
            return selected;
        }
        this.selectedItems.forEach(i => {
            if (this.results[index].fileName === i.fileName) {
                selected = true;
            }
        });
        return selected;
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseVideoLibraryComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], CourseVideoLibraryComponent.prototype, "selectedItems", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], CourseVideoLibraryComponent.prototype, "messageEvent", void 0);
CourseVideoLibraryComponent = __decorate([
    Component({
        selector: 'app-course-video-library',
        templateUrl: './course-video-library.component.html',
        styleUrls: ['./course-video-library.component.scss']
    }),
    __metadata("design:paramtypes", [DataService,
        AlertService])
], CourseVideoLibraryComponent);
export { CourseVideoLibraryComponent };
//# sourceMappingURL=course-video-library.component.js.map